import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16 font-sans dark:bg-black">
      <main className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          SmartDesk
        </Link>
        {children}
      </main>
    </div>
  );
}
