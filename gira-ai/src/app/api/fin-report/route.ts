import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import OpenAI from "openai";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch transactions
  const { data, error } = await supabase
    .from("transactions")
    .select("date, category, amount, type")
    .eq("user_id", session.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ summary: "Ainda não há dados financeiros suficientes para gerar um relatório." });
  }

  const revenue = data
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = data
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const profit = revenue - expense;

  const categoryTotals: Record<string, number> = {};
  data
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    });
  const top = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([c, v]) => `${c}: R$ ${v.toFixed(2)}`)
    .join("; ");

  // Build prompt (PT-BR)
  const prompt = `Você é um analista financeiro. Resuma em até 4 frases a situação da empresa com base nestes dados: Receita total R$ ${revenue.toFixed(
    2,
  )}, Despesa total R$ ${expense.toFixed(
    2,
  )}, Lucro R$ ${profit.toFixed(
    2,
  )}. Principais categorias de despesa: ${top}. Fale em português claro e sugira uma melhoria.`;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    });

    const summary = completion.choices[0].message.content;
    return NextResponse.json({ summary });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ summary: "Resumo indisponível no momento." });
  }
}