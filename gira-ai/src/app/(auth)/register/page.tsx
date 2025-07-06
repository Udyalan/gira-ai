import RegisterForm from "@/features/auth/RegisterForm";

export const metadata = {
  title: "Criar conta | gira.ai",
};

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <RegisterForm />
    </div>
  );
}