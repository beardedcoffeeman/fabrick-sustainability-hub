// MS365 Graph wrapper — app-only / client-credentials flow.
// Port of Client-System/_scripts/ms365-graph.py for server-side use in Pulse.
//
// Requires env:
//   MS365_GRAPH_TENANT_ID
//   MS365_GRAPH_CLIENT_ID
//   MS365_GRAPH_CLIENT_SECRET
//   MS365_GRAPH_USER_UPN  (e.g. tom.colgan@fabrick.agency)

type TokenCache = { token: string; expiresAt: number };
let cachedToken: TokenCache | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }
  const tenant = process.env.MS365_GRAPH_TENANT_ID;
  const clientId = process.env.MS365_GRAPH_CLIENT_ID;
  const clientSecret = process.env.MS365_GRAPH_CLIENT_SECRET;
  if (!tenant || !clientId || !clientSecret) {
    throw new Error(
      "MS365_GRAPH_TENANT_ID / MS365_GRAPH_CLIENT_ID / MS365_GRAPH_CLIENT_SECRET not set in env.",
    );
  }
  const res = await fetch(
    `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`MS365 token request failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return json.access_token;
}

async function graphGet<T>(path: string): Promise<T> {
  const token = await getToken();
  const url = path.startsWith("http") ? path : `https://graph.microsoft.com/v1.0${path}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`Graph GET ${path} failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as T;
}

const USER_UPN = () => {
  const upn = process.env.MS365_GRAPH_USER_UPN;
  if (!upn) throw new Error("MS365_GRAPH_USER_UPN not set");
  return upn;
};

export type GraphEvent = {
  id: string;
  subject: string;
  bodyPreview: string;
  isAllDay: boolean;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: { displayName?: string };
  attendees?: Array<{ emailAddress: { name?: string; address?: string } }>;
  organizer?: { emailAddress: { name?: string; address?: string } };
  webLink?: string;
};

export type GraphMessage = {
  id: string;
  subject: string;
  bodyPreview: string;
  from?: { emailAddress: { name?: string; address?: string } };
  receivedDateTime: string;
  webLink?: string;
  isRead?: boolean;
};

export async function getCalendarEvents(start: Date, end: Date): Promise<GraphEvent[]> {
  const upn = USER_UPN();
  const params = new URLSearchParams({
    startDateTime: start.toISOString(),
    endDateTime: end.toISOString(),
    $orderby: "start/dateTime",
    $top: "100",
    $select:
      "id,subject,bodyPreview,isAllDay,start,end,location,attendees,organizer,webLink",
  });
  const data = await graphGet<{ value: GraphEvent[] }>(
    `/users/${encodeURIComponent(upn)}/calendarView?${params}`,
  );
  return data.value;
}

export async function getInboxMessages(sinceISO: string, top = 50): Promise<GraphMessage[]> {
  const upn = USER_UPN();
  const params = new URLSearchParams({
    $filter: `receivedDateTime ge ${sinceISO}`,
    $orderby: "receivedDateTime desc",
    $top: String(top),
    $select: "id,subject,bodyPreview,from,receivedDateTime,webLink,isRead",
  });
  const data = await graphGet<{ value: GraphMessage[] }>(
    `/users/${encodeURIComponent(upn)}/mailFolders/inbox/messages?${params}`,
  );
  return data.value;
}
