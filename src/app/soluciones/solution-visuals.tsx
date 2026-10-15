import { BotIcon, DeskIcon, GlobeIcon } from "../_home/icons";
import type { SolutionId } from "./solutions";

/* Decorative illustrations of each service (sample content, not real data). */

function DeskVisual() {
  const columns = [
    { title: "Pendiente", cards: ["Presupuesto web", "Llamar a Talleres Ana"] },
    { title: "En curso", cards: ["Rediseño tienda", "Informe mensual"] },
    { title: "Hecho", cards: ["Alta de cliente"] },
  ];
  const days = ["L", "M", "X", "J", "V"];
  return (
    <div className="so-window">
      <div className="so-window__bar">
        <DeskIcon className="size-4 text-blue-300" />
        <span>SmartDesk · Tareas</span>
      </div>
      <div className="grid grid-cols-3 gap-2 p-3">
        {columns.map((column, c) => (
          <div key={column.title} className="rounded-lg bg-white/[0.03] p-2">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{column.title}</p>
            {column.cards.map((card, i) => (
              <p
                key={card}
                className="so-task mb-1.5 rounded-md bg-slate-800/80 px-2 py-1.5 text-[10px] text-slate-200"
                style={{ animationDelay: `${(c * 2 + i) * 0.6}s` }}
              >
                {card}
              </p>
            ))}
          </div>
        ))}
      </div>
      <div className="mx-3 mb-3 grid grid-cols-5 gap-1.5 rounded-lg bg-white/[0.03] p-2">
        {days.map((day, i) => (
          <div key={day} className="text-center">
            <p className="text-[9px] text-slate-500">{day}</p>
            <span className={`mx-auto mt-1 block h-1.5 rounded-full ${i === 1 || i === 3 ? "bg-blue-400" : "bg-white/10"}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function AiVisual() {
  return (
    <div className="so-window">
      <div className="so-window__bar">
        <BotIcon className="size-4 text-violet-300" />
        <span>Asistente SmartAI</span>
      </div>
      <div className="flex flex-col gap-2.5 p-4 text-[11px]">
        <p className="so-msg so-msg--me ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-violet-600 px-3 py-2 text-white">
          Prepara el presupuesto de la web para Talleres Ana
        </p>
        <div className="so-msg so-msg--bot max-w-[85%] rounded-2xl rounded-bl-sm bg-white/[0.06] px-3 py-2 text-slate-200">
          <p className="font-semibold text-violet-200">Presupuesto listo</p>
          <p className="mt-1 text-slate-400">Diseño · Desarrollo · Mantenimiento</p>
          <p className="mt-2 inline-block rounded-md bg-violet-500/20 px-2 py-0.5 text-violet-100">Enviar por correo</p>
        </div>
        <span className="so-typing inline-flex w-fit gap-1 rounded-full bg-white/[0.06] px-3 py-2">
          <i />
          <i />
          <i />
        </span>
      </div>
    </div>
  );
}

function WebVisual() {
  return (
    <div className="relative">
      <div className="so-window">
        <div className="so-window__bar">
          <span className="flex gap-1">
            <i className="size-2 rounded-full bg-rose-400/70" />
            <i className="size-2 rounded-full bg-amber-400/70" />
            <i className="size-2 rounded-full bg-emerald-400/70" />
          </span>
          <span className="ml-2 flex-1 truncate rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
            www.tuempresa.es
          </span>
        </div>
        <div className="p-4">
          <div className="so-shimmer rounded-xl bg-gradient-to-br from-emerald-500/30 via-teal-500/10 to-transparent p-4">
            <p className="text-sm font-bold leading-tight text-white">
              Tu negocio,
              <br />
              abierto 24 horas
            </p>
            <span className="mt-2 inline-block rounded-md bg-emerald-500 px-2 py-1 text-[9px] font-semibold text-emerald-950">
              Pedir presupuesto
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((n) => (
              <span key={n} className="h-10 rounded-lg bg-white/[0.05]" />
            ))}
          </div>
        </div>
      </div>
      <div className="so-phone absolute -bottom-6 -right-2 w-24 sm:-right-6">
        <div className="rounded-lg bg-gradient-to-b from-emerald-500/40 to-transparent p-2">
          <GlobeIcon className="size-4 text-emerald-200" />
          <span className="mt-2 block h-1.5 w-12 rounded-full bg-white/40" />
          <span className="mt-1 block h-1.5 w-8 rounded-full bg-white/20" />
        </div>
        <span className="mt-2 block h-6 rounded-md bg-white/[0.06]" />
        <span className="mt-1.5 block h-6 rounded-md bg-white/[0.06]" />
      </div>
    </div>
  );
}

export function SolutionVisual({ id }: { id: SolutionId }) {
  return (
    <div aria-hidden="true" className={`so-visual so-visual--${id}`}>
      {id === "smartdesk" ? <DeskVisual /> : id === "smartai" ? <AiVisual /> : <WebVisual />}
    </div>
  );
}
