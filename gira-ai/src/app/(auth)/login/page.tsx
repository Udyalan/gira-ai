import LoginForm from "@/features/auth/LoginForm";

export const metadata = {
  title: "Entrar | gira.ai",
};

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <LoginForm />
    </div>
  );
}