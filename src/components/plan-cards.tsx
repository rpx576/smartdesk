import Link from "next/link";
import { formatPlanPrice, type Plan } from "@/content/plans";
import { quoteHref } from "@/content/site";
import { CheckList } from "./ui";

/** Commercial plans of a service. Prices come from `content/plans.ts`; without one, "Precio a consultar". */
export function PlanCards({ plans, service, note }: { plans: Plan[]; service: string; note?: string }) {
  return (
    <>
      <ul className={`sh-stagger mt-12 grid gap-6 ${plans.length === 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3"}`}>
        {plans.map((plan) => (
          <li
            key={plan.id}
            data-reveal
            className={`relative flex flex-col rounded-3xl border p-7 ${
              plan.featured ? "border-blue-400/50 bg-gradient-to-b from-blue-900/40 to-slate-950 shadow-2xl shadow-blue-900/30" : "border-white/10 bg-white/[0.03]"
            }`}
          >
            {plan.featured && (
              <span className="absolute -top-3 left-7 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">Recomendado</span>
            )}
            <h3 className="text-xl font-bold text-white">{plan.name}</h3>
            <p className="mt-2 text-sm text-slate-400">{plan.description}</p>
            <p className="mt-5 text-2xl font-bold text-white">
              {formatPlanPrice(plan)}
              {plan.price !== null && <span className="ml-1 text-xs font-normal text-slate-400">+ IVA</span>}
            </p>
            <CheckList items={plan.features} className="mt-6 flex-1" />
            <Link
              href={`${quoteHref(service).replace("#formulario", "")}&plan=${plan.id}#formulario`}
              className={`mt-8 inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                plan.featured ? "bg-blue-600 text-white hover:bg-blue-500" : "border border-white/20 text-white hover:bg-white/5"
              }`}
            >
              Solicitar {plan.name}
            </Link>
          </li>
        ))}
      </ul>
      {note && <p className="mt-6 text-sm text-slate-400">{note}</p>}
    </>
  );
}
