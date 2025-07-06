"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";

interface Transaction {
  date: string;
  category: string;
  amount: number;
  type: "income" | "expense";
}

export default function UploadCSV() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    setMessage(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: Papa.ParseResult<Record<string, string>>) => {
        const data: Transaction[] = (results.data as any[]).map((row) => ({
          date: row.date || row.Date || row.data,
          category: row.category || row.Category || "Outro",
          amount: Number(row.amount || row.Amount || row.valor),
          type:
            (row.type || row.Type || row.tipo || "").toLowerCase() ===
            "expense"
              ? "expense"
              : "income",
        }));

        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactions: data }),
        });

        if (res.ok) {
          setMessage("Dados enviados com sucesso!");
        } else {
          const txt = await res.text();
          setMessage(`Erro ao enviar: ${txt}`);
        }
        setLoading(false);
      },
      error: (err: any) => {
        console.error(err);
        setMessage("Falha ao ler CSV");
        setLoading(false);
      },
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <input
        type="file"
        accept=".csv,text/csv"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="border rounded p-3 w-full text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        disabled={loading}
      >
        {loading ? "Enviando..." : "Selecionar arquivo CSV"}
      </button>
      {message && <p className="text-sm text-center">{message}</p>}
    </div>
  );
}