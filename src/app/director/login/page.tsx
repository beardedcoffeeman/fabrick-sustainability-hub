import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DirectorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  if (session) redirect(callbackUrl ?? "/director");

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 p-4">
      <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold">Director&apos;s Brief</h1>
        <p className="mb-6 text-sm text-stone-600">
          Sign in with your Fabrick Google account.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: callbackUrl ?? "/director" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}
