"use client";

import { useEffect } from "react";

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
