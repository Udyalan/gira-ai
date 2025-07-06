"use client";

import usePlan from "@/hooks/usePlan";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PricingTable() {
  const { plan, isLoading } = usePlan();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    const res = await fetch("/api/stripe/create-checkout-session", { method: "POST" });
    const json = await res.json();
    if (json.url) {
      router.push(json.url);
    }
    setLoading(false);
  };

  if (isLoading) return <p>Carregando...</p>;

  const isPro = plan === "pro";

  return (
    <div className="flex flex-col items-center gap-8">
      <h1 className="text-3xl font-bold">Planos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Free Plan */}
        <div className="border rounded shadow p-6 flex flex-col gap-4 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold">Gratuito</h2>
          <p className="text-4xl font-bold">R$ 0</p>
          <ul className="list-disc list-inside text-sm flex-1 text-gray-700 dark:text-gray-300">
            <li>Até 50 transações por upload</li>
            <li>Gráficos básicos</li>
            <li>Sem resumo de IA</li>
          </ul>
          {isPro ? (
            <button className="bg-gray-300 text-gray-600 cursor-not-allowed rounded py-2">
              Seu plano atual
            </button>
          ) : (
            <button className="bg-gray-300 text-gray-600 rounded py-2 cursor-not-allowed">
              Padrão
            </button>
          )}
        </div>
        {/* Pro Plan */}
        <div className="border-2 border-blue-600 rounded shadow p-6 flex flex-col gap-4 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold">Pro</h2>
          <p className="text-4xl font-bold">R$ 29<span className="text-base">/mês</span></p>
          <ul className="list-disc list-inside text-sm flex-1 text-gray-700 dark:text-gray-300">
            <li>Uploads ilimitados</li>
            <li>Resumo de IA</li>
            <li>Futuros recursos premium</li>
          </ul>
          {isPro ? (
            <button className="bg-green-600 text-white rounded py-2 cursor-default">
              Você já é Pro
            </button>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Redirecionando..." : "Assinar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}