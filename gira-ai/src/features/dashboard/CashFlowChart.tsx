"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import useTransactions from "@/hooks/useTransactions";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/pt-br";

dayjs.extend(localizedFormat);

export default function CashFlowChart() {
  const { transactions, isLoading } = useTransactions();

  const monthly = transactions.reduce<Record<string, { income: number; expense: number }>>(
    (acc, t) => {
      const key = dayjs(t.date).format("YYYY-MM");
      if (!acc[key]) acc[key] = { income: 0, expense: 0 };
      acc[key][t.type] += t.amount;
      return acc;
    },
    {},
  );

  const data = Object.entries(monthly)
    .map(([month, values]) => ({
      month: dayjs(month).format("MMM/YY"),
      Receita: values.income,
      Despesa: values.expense,
      Lucro: values.income - values.expense,
    }))
    .sort((a, b) => dayjs(a.month, "MMM/YY").valueOf() - dayjs(b.month, "MMM/YY").valueOf());

  if (isLoading) return <p>Carregando gráfico...</p>;
  if (data.length === 0) return <p>Nenhum dado para exibir.</p>;

  return (
    <div className="w-full h-80 bg-white dark:bg-gray-800 p-4 rounded shadow">
      <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
        Fluxo de Caixa Mensal
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
          <Line type="monotone" dataKey="Receita" stroke="#16a34a" strokeWidth={2} />
          <Line type="monotone" dataKey="Despesa" stroke="#dc2626" strokeWidth={2} />
          <Line type="monotone" dataKey="Lucro" stroke="#2563eb" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}