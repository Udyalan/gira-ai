import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ plan: "free" });
  }
  const { data } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", session.user.id)
    .maybeSingle();
  return NextResponse.json({ plan: data?.plan ?? "free" });
}