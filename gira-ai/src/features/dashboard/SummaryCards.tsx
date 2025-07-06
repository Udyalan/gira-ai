"use client";

import useTransactions from "@/hooks/useTransactions";

export default function SummaryCards() {
  const { transactions, isLoading } = useTransactions();

  const revenue = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const profit = revenue - expense;

  if (isLoading) return <p>Carregando...</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl">
      <div className="p-4 rounded shadow bg-white dark:bg-gray-800">
        <h3 className="text-sm text-gray-500">Receita</h3>
        <p className="text-2xl font-semibold">R$ {revenue.toFixed(2)}</p>
      </div>
      <div className="p-4 rounded shadow bg-white dark:bg-gray-800">
        <h3 className="text-sm text-gray-500">Despesa</h3>
        <p className="text-2xl font-semibold">R$ {expense.toFixed(2)}</p>
      </div>
      <div className="p-4 rounded shadow bg-white dark:bg-gray-800">
        <h3 className="text-sm text-gray-500">Lucro</h3>
        <p className="text-2xl font-semibold">R$ {profit.toFixed(2)}</p>
      </div>
    </div>
  );
}