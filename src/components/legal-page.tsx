import type { ReactNode } from "react";
import { AlertIcon } from "./icons";
import { COMPANY, hasPendingLegalData, pending } from "@/content/company";

/** Layout of the legal pages: readable column, last review date and the pending-data warning. */
export function LegalPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <main className="flex-1 px-4 py-14 sm:px-6 sm:py-20">
      <article className="sh-legal mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-white">{title}</h1>
        <p className="mt-3 text-sm text-slate-400">Última revisión: {pending(COMPANY.lastReview, "fecha de revisión")}</p>
        {hasPendingLegalData() && (
          <div role="note" className="mt-8 flex gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 text-sm text-amber-100">
            <AlertIcon className="mt-0.5 size-5 shrink-0 text-amber-300" />
            <p>
              Documento en preparación. Los datos marcados como <strong>[PENDIENTE]</strong> deben completarse con la
              información real del titular y el texto debe revisarlo un profesional jurídico antes de publicar la web.
            </p>
          </div>
        )}
        {intro && <p className="mt-8 text-lg text-slate-300">{intro}</p>}
        <div className="mt-8">{children}</div>
      </article>
    </main>
  );
}

/** The owner's identification block, shared by the legal notice and the privacy policy. */
export function OwnerData() {
  return (
    <dl className="grid gap-x-6 gap-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-[auto_1fr]">
      <dt>Titular</dt>
      <dd>{pending(COMPANY.legalName, "nombre o razón social")}</dd>
      <dt>NIF/CIF</dt>
      <dd>{pending(COMPANY.taxId, "NIF o CIF")}</dd>
      <dt>Domicilio</dt>
      <dd>{pending(COMPANY.address, "domicilio")}</dd>
      <dt>Correo electrónico</dt>
      <dd>{pending(COMPANY.email, "correo de contacto")}</dd>
      <dt>Teléfono</dt>
      <dd>{COMPANY.phone}</dd>
      <dt>Datos registrales</dt>
      <dd>{pending(COMPANY.registry, "Registro Mercantil, si es una sociedad; si no, eliminar")}</dd>
    </dl>
  );
}
