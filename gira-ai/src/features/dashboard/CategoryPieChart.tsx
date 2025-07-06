"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import useTransactions from "@/hooks/useTransactions";
import { useMemo } from "react";

const COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#d97706",
  "#9333ea",
  "#0d9488",
  "#e11d48",
  "#7c3aed",
];

export default function CategoryPieChart() {
  const { transactions, isLoading } = useTransactions();

  const data = useMemo(() => {
    const totals: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        totals[t.category] = (totals[t.category] || 0) + t.amount;
      });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  if (isLoading) return <p>Carregando gráfico...</p>;
  if (data.length === 0) return <p>Nenhum gasto para exibir.</p>;

  return (
    <div className="w-full h-80 bg-white dark:bg-gray-800 p-4 rounded shadow">
      <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
        Despesa por Categoria
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={40}
            label={(d) => d.name}
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
          <Legend layout="vertical" align="right" verticalAlign="middle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}