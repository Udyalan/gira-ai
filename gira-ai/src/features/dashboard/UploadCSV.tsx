"use client";

import { useRef, useState } from "react";
import Papa, { ParseError, ParseResult } from "papaparse";
import * as XLSX from "xlsx";
import useTransactions from "@/hooks/useTransactions";
import usePlan from "@/hooks/usePlan";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

interface Transaction {
  date: string;
  category: string;
  amount: number;
  type: "income" | "expense";
}

type RawRow = Record<string, unknown>;

export default function UploadCSV() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { mutate } = useTransactions();
  const { plan } = usePlan();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleFile = async (file: File): Promise<void> => {
    setLoading(true);
    setMessage(null);

    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<RawRow>(ws);
      await handleParsed(json);
      return;
    }

    // CSV fallback
    Papa.parse<RawRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: ParseResult<RawRow>) => {
        await handleParsed(results.data);
      },
      error: (err: ParseError) => {
        console.error(err);
        setMessage("Falha ao ler CSV");
        setLoading(false);
      },
    });
  };

  const handleParsed = async (rows: RawRow[]): Promise<void> => {
    if (plan !== "pro" && rows.length > 50) {
      setMessage("Plano gratuito permite até 50 transações por upload.");
      setLoading(false);
      return;
    }

    const data: Transaction[] = rows.map((row) => ({
      date: parseDate(String(row.date ?? row.Date ?? row.data ?? "")),
      category: String(row.category ?? row.Category ?? "Outro"),
      amount: Number(row.amount ?? row.Amount ?? row.valor ?? 0),
      type:
        String(row.type ?? row.Type ?? row.tipo ?? "income").toLowerCase() ===
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
      const json = await res.json();
      setMessage(`Foram inseridos ${json.inserted ?? data.length} registros.`);
      mutate();
    } else {
      const txt = await res.text();
      setMessage(`Erro ao enviar: ${txt}`);
    }
    setLoading(false);
  };

  const parseDate = (val: string): string => {
    // tenta formatos comuns dia/mês/ano ou mês/dia/ano, fallback ISO
    const formats = ["DD/MM/YYYY", "D/M/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
    for (const fmt of formats) {
      const d = dayjs(val, fmt, true);
      if (d.isValid()) return d.format("YYYY-MM-DD");
    }
    // se falhar, retorna string original (Supabase pode tentar converter)
    return val;
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