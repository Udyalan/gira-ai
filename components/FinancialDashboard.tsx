// File: components/FinancialDashboard.tsx

import { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  Tooltip, ResponsiveContainer, XAxis, YAxis, Legend
} from "recharts";

// Exemplo de dados de entrada
const rawData = {
  resumo: "A planilha mostra aumento de receita mensal, com pico em julho e despesas concentradas em marketing.",
  periodos: {
    semana: [
      { label: "Seg", receita: 1200, despesa: 500 },
      { label: "Ter", receita: 1500, despesa: 600 },
      { label: "Qua", receita: 1800, despesa: 700 },
      { label: "Qui", receita: 1700, despesa: 800 },
      { label: "Sex", receita: 1900, despesa: 900 },
    ],
    mes: Array.from({ length: 4 }, (_, i) => ({
      label: `Semana ${i + 1}`, receita: 5000 + i * 1000, despesa: 2000 + i * 500
    })),
    ano: [
      { label: "Jan", receita: 10000, despesa: 4000 },
      { label: "Fev", receita: 11000, despesa: 4500 },
      { label: "Mar", receita: 12000, despesa: 4700 },
      { label: "Abr", receita: 13000, despesa: 5000 },
      { label: "Mai", receita: 14000, despesa: 5200 },
    ],
  }
};

const COLORS = ["#60A5FA", "#F87171"];

export default function FinancialDashboard() {
  const [periodo, setPeriodo] = useState<"semana" | "mes" | "ano">("mes");

  const data = useMemo(() => rawData.periodos[periodo], [periodo]);

  const totais = useMemo(() => {
    const receita = data.reduce((sum, d) => sum + d.receita, 0);
    const despesa = data.reduce((sum, d) => sum + d.despesa, 0);
    const mediaR = receita / data.length;
    const mediaD = despesa / data.length;
    const crescimento = ((data[data.length - 1].receita - data[0].receita) / data[0].receita) * 100;
    return {
      receita: receita.toFixed(2),
      despesa: despesa.toFixed(2),
      media: mediaR.toFixed(2),
      crescimento: crescimento.toFixed(2)
    };
  }, [data]);

  return (
    <div className="p-6 max-w-screen-lg mx-auto space-y-8 text-gray-800">
      {/* Filtro de período */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold">Relatório Financeiro</h2>
        <div className="space-x-2">
          {["semana", "mes", "ano"].map(p => (
            <button
              key={p}
              onClick={() => setPeriodo(p as any)}
              className={`px-4 py-2 rounded ${
                periodo === p ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Receita Total" value={`R$ ${totais.receita}`} />
        <MetricCard label="Despesa Total" value={`R$ ${totais.despesa}`} />
        <MetricCard label="Receita Média" value={`R$ ${totais.media}`} />
        <MetricCard label="Crescimento" value={`${totais.crescimento}%`} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de barras */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Receita vs Despesa</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="receita" fill={COLORS[0]} />
              <Bar dataKey="despesa" fill={COLORS[1]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de linhas */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Variação da Receita</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="receita" stroke={COLORS[0]} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de pizza */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2">Proporção Receita / Despesa</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={[
                { name: "Receita", value: parseFloat(totais.receita) },
                { name: "Despesa", value: parseFloat(totais.despesa) },
              ]}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Resumo textual */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">Resumo da Análise</h3>
        <p className="text-gray-700 whitespace-pre-line">{rawData.resumo}</p>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
