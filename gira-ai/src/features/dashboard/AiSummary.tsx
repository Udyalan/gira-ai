"use client";

import useSWR from "swr";
import ProFeatureGate from "@/components/ProFeatureGate";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AiSummary() {
  const { data, isLoading } = useSWR<{ summary: string }>("/api/fin-report", fetcher);

  if (isLoading) return <p>Gerando resumo...</p>;

  return (
    <ProFeatureGate>
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
          Resumo da IA
        </h3>
        <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line">
          {data?.summary}
        </p>
      </div>
    </ProFeatureGate>
  );
}