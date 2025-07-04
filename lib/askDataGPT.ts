// File: lib/askDataGPT.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface DataContext {
  columns: string[];
  stats: Record<string, { sum: number; avg: number; min: number; max: number }>;
  summary: string;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  name?: string;
}

export async function askDataGPT(
  question: string,
  context: DataContext,
  history: Message[] = []
): Promise<string> {
  const systemPrompt = `Você é um analista inteligente que responde perguntas sobre dados de planilhas com base nos seguintes contexto:

- Colunas disponíveis: ${context.columns.join(", ")}.
- Estatísticas por coluna:
${Object.entries(context.stats)
    .map(
      ([col, s]) =>
        `  • ${col}: soma=${s.sum}, média=${s.avg}, min=${s.min}, max=${s.max}`
    )
    .join("\n")}
- Resumo geral: ${context.summary}

Responda de forma clara, sucinta e com base nos dados fornecidos. Se a pergunta for irrelevante ou impossível de responder com os dados, explique por quê.`;

  // Prepara mensagens para o chat
  const messages: {
    role: "user" | "assistant" | "system";
    content: string;
    name?: string;
  }[] = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: question },
  ];

  // Chama a API da OpenAI
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages,
    temperature: 0.3,
  });

  return response.choices[0].message?.content ?? "";
}

