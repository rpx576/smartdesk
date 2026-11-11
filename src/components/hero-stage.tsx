"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { BRAND } from "@/content/site";
import { startPlanet } from "./planet";

/** Where the four service words sit on the banner, as a share of the picture. */
const HOTSPOTS = [
  { href: "/creacion-web", label: "Creación web", left: 12.2, width: 18.5 },
  { href: "/mantenimiento-web", label: "Mantenimiento web", left: 34.6, width: 19.5 },
  { href: "/seo", label: "SEO", left: 57.5, width: 8.6 },
  { href: "/ciberseguridad", label: "Ciberseguridad", left: 69, width: 18.6 },
];

/**
 * Full-width home hero. The Advanthor banner blends into the background, and a
 * real 3D planet (WebGL) replaces the one drawn in the picture: it turns slowly,
 * follows the pointer and can be spun by dragging. Without WebGL, or before the
 * planet is ready, the planet of the picture is shown instead. With reduced
 * motion the planet is drawn once and stays still. The service words of the
 * banner are real links, so keyboard and screen reader users reach the same pages.
 */
export function HeroStage({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const banner = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const [node, picture, surface] = [root.current, banner.current, canvas.current];
    if (!node || !picture || !surface) return;
    // The planet is decoration: it starts once the page has loaded and the
    // browser is idle, so it never delays the banner or the first interaction.
    let stop: (() => void) | undefined;
    let timer = 0;
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      stop = startPlanet({ root: node, banner: picture, canvas: surface });
    };
    const begin = () => {
      timer = window.setTimeout(() => {
        if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(run, { timeout: 2000 });
        else run();
      }, 200);
    };
    if (document.readyState === "complete") begin();
    else window.addEventListener("load", begin, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", begin);
      window.clearTimeout(timer);
      stop?.();
    };
  }, []);

  return (
    <div ref={root} className="sh-hero">
      <div aria-hidden="true" className="sh-stars pointer-events-none absolute inset-0" />
      <div ref={banner} className="sh-hero__banner">
        <Image
          src={BRAND.heroImage}
          alt="Advanthor, soluciones digitales avanzadas: creación web, mantenimiento, SEO y ciberseguridad"
          width={1672}
          height={941}
          preload
          sizes="(min-width: 1680px) 1680px, 100vw"
          quality={85}
          className="sh-hero__image"
        />
        <span aria-hidden="true" className="sh-hero__ring" />
        <nav aria-label="Servicios del banner">
          {HOTSPOTS.map((spot) => (
            <Link
              key={spot.href}
              href={spot.href}
              className="sh-hotspot"
              style={{ left: `${spot.left}%`, width: `${spot.width}%` }}
            >
              <span className="sr-only">{spot.label}</span>
              <span aria-hidden="true" className="sh-hotspot__tip max-sm:hidden">
                {spot.label} →
              </span>
            </Link>
          ))}
        </nav>
      </div>
      <canvas ref={canvas} aria-hidden="true" className="sh-hero__planet" />
      <div className="sh-hero__content">{children}</div>
    </div>
  );
}
