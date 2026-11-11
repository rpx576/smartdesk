"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type PointerEvent } from "react";
import { BRAND } from "@/content/site";

/**
 * Where the four service words sit on the banner, as a share of the card
 * (the picture is drawn 6 % larger than the card so it can move with the tilt).
 */
const HOTSPOTS = [
  { href: "/creacion-web", label: "Creación web", left: 10.6, width: 18.5 },
  { href: "/mantenimiento-web", label: "Mantenimiento web", left: 34.3, width: 19.8 },
  { href: "/seo", label: "SEO", left: 58.2, width: 8.6 },
  { href: "/ciberseguridad", label: "Ciberseguridad", left: 70.8, width: 18.7 },
];

const MAX_TILT = 6;

/**
 * The Advanthor banner as an interactive stage: it tilts towards the pointer,
 * a light follows the cursor and each service word links to its page.
 * Only fine pointers (mouse, trackpad) move it; it stays still on touch
 * screens and with reduced motion. The words of the banner are also real
 * links, so keyboard and screen reader users reach the same pages.
 */
export function HeroStage() {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  function canMove() {
    return window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches;
  }

  function onMove(event: PointerEvent<HTMLDivElement>) {
    const stage = ref.current;
    if (!stage || event.pointerType !== "mouse" || !canMove()) return;
    const rect = stage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      stage.dataset.active = "true";
      stage.style.setProperty("--ry", `${((x - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
      stage.style.setProperty("--rx", `${((0.5 - y) * 2 * MAX_TILT).toFixed(2)}deg`);
      stage.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
      stage.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    });
  }

  function onLeave() {
    const stage = ref.current;
    if (!stage) return;
    cancelAnimationFrame(frame.current);
    delete stage.dataset.active;
    for (const name of ["--rx", "--ry"]) stage.style.setProperty(name, "0deg");
  }

  return (
    <div ref={ref} className="sh-stage mx-auto w-full" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="sh-stage__card">
        <Image
          src={BRAND.heroImage}
          alt="Advanthor, soluciones digitales avanzadas: creación web, mantenimiento, SEO y ciberseguridad"
          width={1672}
          height={941}
          preload
          sizes="(min-width: 1280px) 1152px, 100vw"
          quality={85}
          className="sh-stage__image"
        />
        <span aria-hidden="true" className="sh-stage__ring" />
        <span aria-hidden="true" className="sh-stage__glare" />
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
    </div>
  );
}
