'use client';

import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {session ? (
        <p className="text-lg">Bem-vindo(a), {session.user?.email}</p>
      ) : (
        <p className="text-lg">Carregando...</p>
      )}
    </div>
  );
}