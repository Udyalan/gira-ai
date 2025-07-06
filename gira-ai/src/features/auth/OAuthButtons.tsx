"use client";

import { signIn } from "next-auth/react";

export default function OAuthButtons() {
  return (
    <div className="flex flex-col gap-3 w-full">
      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="flex items-center justify-center gap-2 border rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        type="button"
      >
        Entrar com Google
      </button>
      <button
        onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
        className="flex items-center justify-center gap-2 border rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        type="button"
      >
        Entrar com GitHub
      </button>
    </div>
  );
}