"use client";

import useSWR from "swr";

interface PlanResp {
  plan: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function usePlan() {
  const { data, isLoading, mutate } = useSWR<PlanResp>("/api/plan", fetcher);
  return {
    plan: data?.plan ?? "free",
    isLoading,
    mutate,
  };
}