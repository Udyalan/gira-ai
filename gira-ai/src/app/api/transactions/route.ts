import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { transactions } = await request.json();

  if (!Array.isArray(transactions)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const mapped = transactions.map((t: any) => ({
    user_id: session.user.id,
    date: t.date,
    category: t.category,
    amount: t.amount,
    type: t.type,
  }));

  // Upsert to avoid duplicados (chave única recomendada: user_id, date, category, amount, type)
  const { error, count } = await supabase
    .from("transactions")
    .upsert(mapped, { onConflict: "user_id,date,category,amount,type", count: "exact" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ inserted: count });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("date, category, amount, type")
    .eq("user_id", session.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ transactions: data });
}