// File: pages/api/ask-data.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { askDataGPT } from "../../lib/askDataGPT";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { question, context, history } = req.body;

  if (!question || !context) {
    return res.status(400).json({ error: "Campos 'question' e 'context' são obrigatórios." });
  }

  try {
    const answer = await askDataGPT(question, context, history || []);
    return res.status(200).json({ answer });
  } catch (err: any) {
    console.error("Erro GPT:", err);
    return res.status(500).json({ error: "Erro ao gerar resposta." });
  }
}
