"use client";

import { useState, type ComponentType, type SVGProps } from "react";
import { ArrowRightIcon, EyeIcon, EyeOffIcon } from "./access-icons";
import { accessButtonClass } from "./styles";

type AccessFieldProps = {
  label: string;
  name: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  placeholder?: string;
  errors?: string[];
  defaultValue?: string;
};

/** Input of the account screens: icon, label and, for passwords, a show/hide toggle. */
export function AccessField({
  label,
  name,
  type = "text",
  autoComplete,
  icon: Icon,
  placeholder,
  errors,
  defaultValue,
}: AccessFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const errorId = name + "-error";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-semibold text-slate-800">
        {label}
      </label>
      <div
        className={
          "group flex items-center gap-3 rounded-xl border bg-slate-50/80 px-3.5 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/15 " +
          (errors ? "border-red-400" : "border-slate-200")
        }
      >
        <Icon className="size-5 shrink-0 text-slate-500 transition-colors group-focus-within:text-blue-600" />
        <input
          id={name}
          name={name}
          type={isPassword && visible ? "text" : type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          defaultValue={defaultValue}
          required
          aria-invalid={errors ? true : undefined}
          aria-describedby={errors ? errorId : undefined}
          className="h-12 min-w-0 flex-1 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={visible}
            className="-mr-1 rounded-md p-1 text-slate-500 outline-none transition-colors hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {visible ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
          </button>
        )}
      </div>
      {errors && (
        <span id={errorId} className="text-xs text-red-600">
          {errors[0]}
        </span>
      )}
    </div>
  );
}

export function AccessError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      {message}
    </p>
  );
}

export function AccessSubmit({ pending, label, pendingLabel }: { pending: boolean; label: string; pendingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={"mt-1 disabled:cursor-wait disabled:opacity-70 " + accessButtonClass}
    >
      {pending ? pendingLabel : label}
      {!pending && <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />}
    </button>
  );
}
