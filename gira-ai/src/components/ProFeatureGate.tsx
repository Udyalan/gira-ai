"use client";

import usePlan from "@/hooks/usePlan";
import Link from "next/link";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function ProFeatureGate({ children }: Props) {
  const { plan, isLoading } = usePlan();

  if (isLoading) return null;
  if (plan !== "pro") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-blue-500 p-6 rounded">
        <p className="text-center text-sm text-gray-700 dark:text-gray-300">
          Este recurso está disponível apenas no plano <strong>Pro</strong>.
        </p>
        <Link href="/pricing" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Conheça o plano Pro
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}