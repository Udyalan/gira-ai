// File: pages/api/upload.ts

import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import { promisify } from "util";
import XLSX from "xlsx";

export const config = {
  api: {
    bodyParser: false, // desabilita parser padrão para usar formidable
  },
};

const parseForm = (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const form = new formidable.IncomingForm({
    maxFileSize: 10 * 1024 * 1024, // 10MB
    multiples: false,
  });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { files } = await parseForm(req);
    const upload = files.file as File;
    if (!upload) {
      return res.status(400).json({ error: "Nenhum arquivo enviado no campo 'file'." });
    }

    // lê buffer do arquivo
    const data = await promisify(fs.readFile)(upload.filepath);
    let workbook: XLSX.WorkBook;
    const mime = upload.mimetype || "";

    // detecta tipo e lê
    if (mime.includes("spreadsheetml") || upload.originalFilename?.match(/\.(xlsx|xls)$/i)) {
      workbook = XLSX.read(data, { type: "buffer" });
    } else if (mime.includes("csv") || upload.originalFilename?.match(/\.csv$/i)) {
      const text = data.toString("utf8");
      const ws = XLSX.utils.aoa_to_sheet(
        text
          .split(/\r?\n/)
          .map((line) => line.split(","))
      );
      workbook = { SheetNames: ["Sheet1"], Sheets: { Sheet1: ws } };
    } else {
      return res.status(400).json({ error: "Tipo de arquivo inválido. Envie CSV ou Excel." });
    }

    // extrai dados da primeira planilha
    const firstSheet = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheet];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

    if (rows.length === 0) {
      return res.status(400).json({ error: "Planilha sem dados." });
    }

    // identifica colunas
    const columns = Object.keys(rows[0]);

    // analisa estatísticas simples para colunas numéricas
    const numericStats: Record<string, { sum: number; avg: number; min: number; max: number }> = {};
    columns.forEach((col) => {
      const vals = rows
        .map((r) => r[col])
        .filter((v) => typeof v === "number");
      if (vals.length > 0 && vals.length === rows.length) {
        const sum = vals.reduce((a, b) => a + b, 0);
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        numericStats[col] = {
          sum,
          avg: parseFloat((sum / vals.length).toFixed(2)),
          min,
          max,
        };
      }
    });

    // sumariza dimensões
    const rowCount = rows.length;
    const colCount = columns.length;

    // gera resumo textual
    let summary = `A planilha contém ${rowCount} linhas e ${colCount} colunas.`;
    const numCols = Object.keys(numericStats);
    if (numCols.length) {
      summary += " Estatísticas numéricas:\n";
      numCols.forEach((col) => {
        const s = numericStats[col];
        summary += `- ${col}: soma=${s.sum.toFixed(2)}, média=${s.avg.toFixed(2)}, mínimo=${s.min.toFixed(2)}, máximo=${s.max.toFixed(2)}\n`;
      });
    } else {
      summary += " Não foram encontradas colunas totalmente numéricas.";
    }

    // resposta JSON
    return res.status(200).json({
      rowCount,
      colCount,
      columns,
      numericStats,
      summary: summary.trim(),
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    if (err.message.includes("maxFileSize")) {
      return res.status(400).json({ error: "Arquivo excede o tamanho máximo permitido." });
    }
    return res.status(500).json({ error: "Erro ao processar arquivo. Verifique o formato e tente novamente." });
  }
}
