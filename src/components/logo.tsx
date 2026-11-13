import Image from "next/image";
import { BRAND } from "@/content/site";

/** Advanthor logo (round emblem) with the wordmark. The emblem is decorative: the name is real text. */
export function Logo({ size = 36, showName = true, className = "" }: { size?: number; showName?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image src={BRAND.logo} alt="" width={size} height={size} className="shrink-0 rounded-full" />
      {showName && (
        <span className="text-[15px] font-semibold uppercase tracking-[0.22em] text-white">{BRAND.name}</span>
      )}
    </span>
  );
}
