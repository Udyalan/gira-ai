'use client';

import { useSession } from "next-auth/react";
import UploadCSV from "@/features/dashboard/UploadCSV";
import SummaryCards from "@/features/dashboard/SummaryCards";
import CashFlowChart from "@/features/dashboard/CashFlowChart";
import CategoryPieChart from "@/features/dashboard/CategoryPieChart";

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl">
            <CashFlowChart />
            <CategoryPieChart />
          </div>
        </>
      ) : (
        <p className="text-lg">Carregando...</p>
      )}
    </div>
  );
}