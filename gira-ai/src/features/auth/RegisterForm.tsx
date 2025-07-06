"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { signIn } from "next-auth/react";

interface Inputs {
  email: string;
  password: string;
}

export default function RegisterForm() {
  const { register, handleSubmit } = useForm<Inputs>();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: Inputs) => {
    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    await signIn("credentials", {
      ...data,
      callbackUrl: "/dashboard",
    });

    router.push("/dashboard");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 w-full max-w-sm"
    >
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
  );
}