"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OAuthButtons from "./OAuthButtons";
import Link from "next/link";

const schema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Mínimo 6 caracteres" }),
});

type Inputs = z.infer<typeof schema>;

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({ resolver: zodResolver(schema) });

  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const onSubmit = async (data: Inputs) => {
    const res = await signIn("credentials", {
      ...data,
      redirect: false,
      callbackUrl,
    });

    if (res?.error) {
      setError("Credenciais inválidas");
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-8 rounded shadow flex flex-col gap-4">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-center">Entrar</h1>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <input
          {...register("email", { required: true })}
          type="email"
          placeholder="Email"
          className={`border rounded px-3 py-2 focus:ring-2 focus:outline-none ${errors.email ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-500/40"}`}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
        <input
          {...register("password", { required: true })}
          type="password"
          placeholder="Senha"
          className={`border rounded px-3 py-2 focus:ring-2 focus:outline-none ${errors.password ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-500/40"}`}
        />
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-black text-white rounded py-2 disabled:opacity-60 hover:bg-gray-800 transition-colors"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <div className="flex items-center gap-2">
        <hr className="flex-1 border-gray-300" />
        <span className="text-xs text-gray-500">ou</span>
        <hr className="flex-1 border-gray-300" />
      </div>
      <OAuthButtons />
      <p className="text-sm text-center text-gray-600 dark:text-gray-400">
        Não tem conta? <Link href="/register" className="underline">Cadastre-se</Link>
      </p>
    </div>
  );
}