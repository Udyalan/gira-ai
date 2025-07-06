"use client";

import { useEffect, useState } from "react";

interface Transaction {
  date: string;
  category: string;
  amount: number;
  type: "income" | "expense";
}

export default function SummaryCards() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/transactions");
      if (res.ok) {
        const json = await res.json();
        setData(json.transactions as Transaction[]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const revenue = data
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = data
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const profit = revenue - expense;

  if (loading) return <p>Carregando...</p>;

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