"use client";

import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Scroll reveal for every element marked with `data-reveal`: elements still
 * below the screen are hidden and fade in when they scroll into view. Content
 * is visible without JavaScript and for people who prefer reduced motion.
 */
export function RevealOnScroll() {
  useEffect(() => {
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 },
    );
    for (const element of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
      if (element.getBoundingClientRect().top < window.innerHeight) continue;
      element.classList.add("sh-reveal");
      observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);
  return null;
}

/**
 * A figure such as "+500", "+10.000" or "99%" that counts up from 0 the first
 * time it is seen. Anything else (e.g. "24/7") is shown as is.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const match = /^(\+?)([\d.]+)(%?)$/.exec(value);
  const target = match ? Number(match[2].replace(/\./g, "")) : null;
  const [current, setCurrent] = useState<number | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (target === null || !element || prefersReducedMotion() || !("IntersectionObserver" in window)) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / 1600);
          setCurrent(Math.round(target * (1 - (1 - progress) ** 3)));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target]);

  const shown =
    match && current !== null ? `${match[1]}${current.toLocaleString("es-ES", { useGrouping: true })}${match[3]}` : value;
  return (
    <span ref={ref} className={className} aria-label={value}>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}
