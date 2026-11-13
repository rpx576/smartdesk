import type { Metadata } from "next";
import Link from "next/link";
import { AlertIcon, LockIcon, SearchIcon } from "@/components/icons";
import { ServicePage } from "@/components/service-page";
import { CheckList, Section, SectionHeading } from "@/components/ui";
import { SECURITY_BLOCKS } from "@/content/plans";
import { getService } from "@/content/services";
import { quoteHref } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

const service = getService("ciberseguridad");

export const metadata: Metadata = pageMetadata({ title: service.metaTitle, description: service.metaDescription, path: service.href });

const blockStyle = {
  preventivo: { icon: LockIcon, tone: "text-emerald-300 bg-emerald-500/10 border-emerald-400/30" },
  auditoria: { icon: SearchIcon, tone: "text-blue-300 bg-blue-500/10 border-blue-400/30" },
  intervencion: { icon: AlertIcon, tone: "text-amber-300 bg-amber-500/10 border-amber-400/30" },
} as const;

export default function CiberseguridadPage() {
  return (
    <ServicePage service={service}>
      <Section id="modalidades" labelledBy="modalidades-title">
        <SectionHeading
          id="modalidades-title"
          eyebrow="Tipos de servicio"
          title="Prevención, auditoría e intervención"
          text="Tres servicios distintos, con objetivos y condiciones distintas."
          center
        />
        <ul className="sh-stagger mt-12 grid gap-6 lg:grid-cols-3">
          {SECURITY_BLOCKS.map((block) => {
            const { icon: Icon, tone } = blockStyle[block.id];
            return (
              <li key={block.id} data-reveal className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                <span className={`grid size-12 place-items-center rounded-2xl border ${tone}`}>
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-white">{block.name}</h3>
                <p className="mt-2 text-sm text-slate-400">{block.description}</p>
                <CheckList items={block.items} className="mt-5 flex-1" />
                <p className="mt-6 rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs text-slate-400">{block.note}</p>
                <Link
                  href={`${quoteHref(service.id).replace("#formulario", "")}&modalidad=${block.id}#formulario`}
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  Consultar {block.name.toLowerCase()}
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>
    </ServicePage>
  );
}
