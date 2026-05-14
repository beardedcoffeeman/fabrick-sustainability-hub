"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useLiveData<T>(url: string, refreshMs = 120_000) {
  return useSWR<T>(url, fetcher, {
    refreshInterval: refreshMs,
    revalidateOnFocus: true,
  });
}
