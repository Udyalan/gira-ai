"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { signIn } from "next-auth/react";
import OAuthButtons from "./OAuthButtons";
import Link from "next/link";
import TextInput from "@/components/ui/TextInput";

const schema = z
  .object({
    email: z.string().email({ message: "Email inválido" }),
    password: z.string().min(6, { message: "Mínimo 6 caracteres" }),
    confirmPassword: z.string().min(6, { message: "Confirme a senha" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

type Inputs = z.infer<typeof schema>;

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({ resolver: zodResolver(schema) });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: Inputs) => {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // Create profile record
    if (signUpData?.user) {
      await supabase.from("profiles").insert({
        id: signUpData.user.id,
        email: signUpData.user.email,
        plan: "free",
      });
    }

    await signIn("credentials", {
      ...data,
      callbackUrl: "/dashboard",
    });

    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-8 rounded shadow flex flex-col gap-4">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-center">Criar conta</h1>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <TextInput
          label="Email"
          placeholder="seu@email.com"
          type="email"
          register={register("email")}
          error={errors.email}
        />

        <TextInput
          label="Senha"
          placeholder="••••••••"
          enablePasswordToggle
          register={register("password")}
          error={errors.password}
        />

        <TextInput
          label="Confirmar senha"
          placeholder="••••••••"
          enablePasswordToggle
          register={register("confirmPassword")}
          error={errors.confirmPassword}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-black text-white rounded py-2 disabled:opacity-60 hover:bg-gray-800 transition-colors"
        >
          {isSubmitting ? "Registrando..." : "Registrar"}
        </button>
      </form>
      <div className="flex items-center gap-2">
        <hr className="flex-1 border-gray-300" />
        <span className="text-xs text-gray-500">ou</span>
        <hr className="flex-1 border-gray-300" />
      </div>
      <OAuthButtons />
      <p className="text-sm text-center text-gray-600 dark:text-gray-400">
        Já tem conta? <Link href="/login" className="underline">Entrar</Link>
      </p>
    </div>
  );
}