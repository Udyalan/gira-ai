'use client';

import { useSession } from "next-auth/react";
import UploadCSV from "@/features/dashboard/UploadCSV";
import SummaryCards from "@/features/dashboard/SummaryCards";

export default function DashboardPage() {
  const { data: session } = useSession();
  return (
    <div className="flex flex-col items-center min-h-screen p-8 gap-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {session ? (
        <>
          <p className="text-lg">Bem-vindo(a), {session.user?.email}</p>
          <UploadCSV />
          <SummaryCards />
        </>
      ) : (
        <p className="text-lg">Carregando...</p>
      )}
    </div>
  );
}