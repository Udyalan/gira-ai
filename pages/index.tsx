// File: pages/index.tsx

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setSummary(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor, selecione um arquivo primeiro.");
      return;
    }

    setUploading(true);
    setError(null);
    setSummary(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro desconhecido no upload");
      }

      const data = await res.json();
      setSummary(data.summary || "Arquivo processado com sucesso!");
    } catch (err: any) {
      setError(err.message || "Erro ao enviar arquivo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Bem-vindo ao Gira.ai</h1>

      <div className="w-full max-w-md bg-white p-6 rounded shadow space-y-4">
        <label className="block font-medium mb-2" htmlFor="file">
          Selecione uma planilha Excel ou CSV:
        </label>
        <input
          type="file"
          id="file"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={handleFileChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? "Enviando..." : "Enviar Planilha"}
        </button>

        {summary && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded whitespace-pre-line">
            <strong>Resumo:</strong>
            <br />
            {summary}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>
        )}
      </div>
    </main>
  );
}
