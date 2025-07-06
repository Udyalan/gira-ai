"use client";

import { useState, InputHTMLAttributes } from "react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
  enablePasswordToggle?: boolean;
}

export default function TextInput({
  label,
  register,
  error,
  enablePasswordToggle = false,
  type = "text",
  ...rest
}: Props) {
  const [show, setShow] = useState(false);
  const inputType = enablePasswordToggle ? (show ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <input
          {...register}
          {...rest}
          type={inputType}
          className={`w-full border rounded px-3 py-2 focus:ring-2 focus:outline-none dark:bg-gray-900 transition-colors ${
            error
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-500/40 dark:border-gray-600"
          }`}
        />
        {enablePasswordToggle && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400"
            aria-label={show ? "Ocultar senha" : "Mostrar senha"}
          >
            {show ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
    </div>
  );
}