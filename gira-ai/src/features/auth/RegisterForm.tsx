"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { signIn } from "next-auth/react";
import OAuthButtons from "./OAuthButtons";
import Link from "next/link";

interface Inputs {
  email: string;
  password: string;
}

export default function RegisterForm() {
  const { register, handleSubmit } = useForm<Inputs>();
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
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          {...register("email", { required: true })}
          type="email"
          placeholder="Email"
          className="border rounded p-2"
        />
        <input
          {...register("password", { required: true })}
          type="password"
          placeholder="Senha"
          className="border rounded p-2"
        />
        <button
          type="submit"
          className="bg-black text-white rounded py-2 hover:bg-gray-800 transition-colors"
        >
          Registrar
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