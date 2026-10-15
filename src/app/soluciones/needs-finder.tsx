"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon, CheckCircleIcon } from "../smartdesk/(app)/_components/icons";
import { needs, recommendSolutions, solutions } from "./solutions";

const byId = new Map(solutions.map((solution) => [solution.id, solution]));

/**
 * "¿Qué te frena hoy?": the visitor ticks the problems they recognise and the
 * matching services light up, best match first, with a link to each one.
 */
export function NeedsFinder() {
  const [selected, setSelected] = useState<string[]>([]);
  const recommendations = recommendSolutions(selected);
  const best = recommendations[0]?.score ?? 0;

  const toggle = (id: string) =>
    setSelected((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));

  return (
    <div className="so-finder grid gap-8 rounded-3xl p-5 sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
      <fieldset>
        <legend className="text-sm font-semibold text-white">Marca lo que te pasa (puedes elegir varias)</legend>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {needs.map((need) => (
            <label key={need.id} className="so-need">
              <input
                type="checkbox"
                className="sr-only"
                checked={selected.includes(need.id)}
                onChange={() => toggle(need.id)}
              />
              <CheckCircleIcon className="so-need__check size-4 shrink-0" />
              {need.label}
            </label>
          ))}
        </div>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => setSelected([])}
            className="mt-4 text-sm text-slate-400 underline-offset-4 outline-none hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-indigo-400/60"
          >
            Borrar selección
          </button>
        )}
      </fieldset>

      <div aria-live="polite" className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-white">Tu solución</p>
        {recommendations.length === 0 ? (
          <p className="so-result-empty grid flex-1 place-items-center rounded-2xl p-6 text-center text-sm text-slate-400">
            Elige uno o varios retos y te decimos qué servicio encaja contigo.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {recommendations.map(({ id, score }) => {
              const solution = byId.get(id)!;
              const top = score === best;
              return (
                <li key={id} className={`so-result so-result--${id} ${top ? "is-top" : ""} rounded-2xl p-4`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-base font-bold text-white">{solution.name}</span>
                    <span className="so-result__badge rounded-full px-2.5 py-0.5 text-xs font-semibold">
                      {top ? "Encaja mejor" : "También te ayuda"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">{solution.tagline}</p>
                  <a
                    href={`#${id}`}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white outline-none hover:underline focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    Ver cómo funciona
                    <ArrowRightIcon className="size-4" />
                  </a>
                </li>
              );
            })}
          </ul>
        )}
        {recommendations.length > 1 && (
          <p className="text-sm text-slate-400">
            Varios servicios a la vez funcionan mejor juntos.{" "}
            <Link href="/contacto" className="font-semibold text-indigo-300 hover:text-white">
              Pídenos un plan combinado
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
