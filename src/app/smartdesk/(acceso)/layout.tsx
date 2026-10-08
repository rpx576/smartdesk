import Link from "next/link";

/** SmartDesk entry screens. There are no SmartDesk accounts: people use SmartHub's. */
export default function SmartDeskAccessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16 font-sans dark:bg-black">
      <main className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-0.5">
          <span className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">SmartDesk</span>
          <Link href="/" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
            de SmartHub
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}
