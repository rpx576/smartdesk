type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  errors?: string[];
  defaultValue?: string;
};

export function FormField({
  label,
  name,
  type = "text",
  autoComplete,
  errors,
  defaultValue,
}: FormFieldProps) {
  const errorId = `${name}-error`;
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
      {label}
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required
        aria-invalid={errors ? true : undefined}
        aria-describedby={errors ? errorId : undefined}
        className="rounded-md border border-black/[.12] bg-white px-3 py-2 font-normal text-zinc-900 outline-none focus:border-zinc-500 dark:border-white/[.15] dark:bg-zinc-900 dark:text-zinc-100"
      />
      {errors && (
        <span id={errorId} className="text-xs font-normal text-red-600">
          {errors[0]}
        </span>
      )}
    </label>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
      {message}
    </p>
  );
}

export const submitClass =
  "rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300";
