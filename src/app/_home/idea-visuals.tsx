"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import type { Dictionary } from "@/i18n";
import { BotIcon, DeskIcon, GlobeIcon, LogoIcon } from "./icons";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const media = window.matchMedia(reducedMotionQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** True when the system asks for reduced motion (and on the server, so the first paint is still). */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => true,
  );
}

/* Decorative content: it shows the idea behind SmartHub, not real data of any company. */

/** Which product each piece ends up in (the words come from the dictionary, in the same order). */
const pieces = [
  { product: "SmartDesk", tone: "blue" },
  { product: "SmartDesk", tone: "blue" },
  { product: "SmartDesk", tone: "blue" },
  { product: "SmartDesk", tone: "blue" },
  { product: "SmartWeb", tone: "green" },
  { product: "SmartAI", tone: "violet" },
] as const;

/**
 * "From chaos to order": loose notes scattered around that line up inside a
 * single SmartHub panel once the visual scrolls into view. The button lets
 * people switch between both states whenever they like.
 */
export function ChaosToOrder({ copy }: { copy: Dictionary["home"]["chaos"] }) {
  const reducedMotion = usePrefersReducedMotion();
  // null until something decides: people who prefer reduced motion see the ordered state straight away.
  const [choice, setOrdered] = useState<boolean | null>(null);
  const ordered = choice ?? reducedMotion;
  const touched = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || reducedMotion || !("IntersectionObserver" in window)) return;
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timer = window.setTimeout(() => {
          if (!touched.current) setOrdered(true);
        }, 900);
      },
      { threshold: 0.6 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [reducedMotion]);

  return (
    <div>
      <div ref={ref} data-ordered={ordered} className="sh-chaos" aria-hidden="true">
        <div className="sh-chaos__panel">
          <span className="flex items-center gap-2 text-sm font-bold text-white">
            <LogoIcon className="size-5 text-blue-400" />
            SmartHub
          </span>
          <span className="sh-chaos__status">{copy.status}</span>
        </div>
        {pieces.map((piece, index) => (
          <div key={copy.pieces[index].before} className={`sh-chaos__piece sh-chaos__piece--${index + 1} sh-tone-${piece.tone}`}>
            <span className="sh-chaos__dot" />
            <span className="sh-chaos__labels">
              <span className="sh-chaos__before">{copy.pieces[index].before}</span>
              <span className="sh-chaos__after">
                <span className="block font-semibold text-white">{copy.pieces[index].after}</span>
                <span className="sh-chaos__product">{piece.product}</span>
              </span>
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          aria-pressed={ordered}
          onClick={() => {
            touched.current = true;
            setOrdered(!ordered);
          }}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink shadow-sm outline-none transition-colors hover:border-blue-300 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 dark:hover:text-blue-300"
        >
          <span className={`size-2 rounded-full ${ordered ? "bg-emerald-500" : "bg-rose-500"}`} />
          {ordered ? copy.showBefore : copy.showAfter}
        </button>
      </div>
    </div>
  );
}

/** Look and position of the three products (their names and texts come from the dictionary). */
const ecosystemBase = [
  { id: "smartweb", icon: GlobeIcon, color: "#22c55e", position: "sh-node--left" },
  { id: "smartdesk", icon: DeskIcon, color: "#3b82f6", position: "sh-node--top" },
  { id: "smartai", icon: BotIcon, color: "#8b5cf6", position: "sh-node--right" },
] as const;

/**
 * Interactive map of the SmartHub ecosystem: the three products orbit the
 * shared account and data flows between them. It cycles on its own until
 * someone picks a product, and stays still for people who prefer reduced motion.
 */
export function EcosystemHub({
  copy,
  names,
}: {
  copy: Dictionary["home"]["ecosystem"];
  /** Product names in the order of the map: SmartWeb, SmartDesk, SmartAI. */
  names: readonly [string, string, string];
}) {
  const ecosystem = ecosystemBase.map((item, index) => ({ ...item, name: names[index], ...copy.nodes[item.id] }));
  const [active, setActive] = useState(1);
  const [auto, setAuto] = useState(true);
  const motion = !usePrefersReducedMotion();

  useEffect(() => {
    if (!auto || !motion) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % ecosystemBase.length), 4500);
    return () => window.clearInterval(timer);
  }, [auto, motion]);

  const current = ecosystem[active];
  const ends = ["M200 200 L74 286", "M200 200 L200 62", "M200 200 L326 286"];

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
      <div className="relative mx-auto aspect-square w-full max-w-md">
        <svg viewBox="0 0 400 400" aria-hidden="true" className="absolute inset-0 size-full overflow-visible">
          <circle cx="200" cy="200" r="150" className="sh-orbit" />
          <circle cx="200" cy="200" r="104" className="sh-orbit sh-orbit--inner" />
          <path d="M74 286 Q200 360 326 286 M74 286 Q110 120 200 62 M200 62 Q290 120 326 286" className="sh-ring" />
          {ends.map((d, index) => (
            <g key={d}>
              <path d={d} className="sh-link" data-active={index === active} style={{ stroke: ecosystem[index].color, color: ecosystem[index].color }} />
              {motion && (
                <circle r={index === active ? 4.5 : 3} fill={ecosystem[index].color}>
                  <animateMotion dur={index === active ? "1.6s" : "3.2s"} repeatCount="indefinite" path={d} keyPoints="1;0" keyTimes="0;1" calcMode="linear" />
                </circle>
              )}
            </g>
          ))}
        </svg>
        <div className="sh-hub">
          <LogoIcon className="size-9 text-blue-300" />
          <span className="mt-1 text-xs font-bold tracking-wide text-white">SmartHub</span>
          <span className="text-[10px] text-blue-200/70">{copy.account}</span>
        </div>
        {ecosystem.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={index === active}
            onClick={() => {
              setActive(index);
              setAuto(false);
            }}
            className={`sh-node ${item.position}`}
            style={{ "--node": item.color } as CSSProperties}
          >
            <item.icon className="size-6" />
            <span className="text-xs font-bold">{item.name}</span>
            <span className="sh-node__role">{item.role}</span>
          </button>
        ))}
      </div>

      <div aria-live="polite" className="sh-hub-card" style={{ "--node": current.color } as CSSProperties}>
        <div key={current.id} className="sh-pop">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {current.role} · {active + 1}/{ecosystem.length}
          </p>
          <p className="mt-2 flex items-center gap-3 text-2xl font-bold text-white">
            <current.icon className="size-7 shrink-0" style={{ color: current.color }} />
            {current.name}
          </p>
          <p className="mt-4 leading-relaxed text-slate-300">{current.text}</p>
          <p className="mt-4 border-l-2 pl-3 text-sm text-slate-400" style={{ borderColor: current.color }}>
            {current.link}
          </p>
        </div>
        <div className="mt-6 flex gap-1.5" aria-hidden="true">
          {ecosystem.map((item, index) => (
            <span
              key={item.id}
              className={`h-1 rounded-full transition-all duration-500 ${index === active ? "w-8" : "w-3 bg-white/15"}`}
              style={index === active ? { background: item.color } : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
