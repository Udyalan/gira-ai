"use client";

import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Inputs {
  email: string;
  password: string;
}

export default function LoginForm() {
  const { register, handleSubmit } = useForm<Inputs>();
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 w-full max-w-sm"
    >
      <h1 className="text-2xl font-semibold text-center">Entrar</h1>
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
        Entrar
      </button>
    </form>
  );
}