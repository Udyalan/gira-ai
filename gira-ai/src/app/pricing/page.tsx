import PricingTable from "@/features/pricing/PricingTable";

export const metadata = { title: "Planos | gira.ai" };

export default function PricingPage() {
  return (
    <div className="flex justify-center p-8 min-h-screen">
      <PricingTable />
    </div>
  );
}