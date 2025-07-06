"use client";

import useSWR from "swr";

export interface Transaction {
  date: string;
  category: string;
  amount: number;
  type: "income" | "expense";
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function useTransactions() {
  const { data, error, isLoading, mutate } = useSWR<{ transactions: Transaction[] }>(
    "/api/transactions",
    fetcher,
  );

  return {
    transactions: data?.transactions ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}