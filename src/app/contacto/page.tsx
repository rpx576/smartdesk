import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarIcon } from "@/components/icons";
import { publicConfig } from "@/config/env";
import { PHONE_DISPLAY, PHONE_HREF, whatsappUrl } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { ChatPhoneIcon, MailIcon, PhoneIcon } from "./contact-icons";
import { ContactForm } from "./contact-form";
import "./contacto.css";

export const metadata: Metadata = pageMetadata({
  title: "Contacto y presupuesto | Advanthor",
  description: `Pide presupuesto de creación web, mantenimiento, SEO o ciberseguridad. Escríbenos por WhatsApp al ${PHONE_DISPLAY} o rellena el formulario.`,
  path: "/contacto",
});

/** Decorative background: aurora, dot grid and rising chat bubbles. */
function ContactBackground() {
  return (
    <div className="ct-bg" aria-hidden="true">
      <div className="ct-dots" />
      <div className="ct-aurora ct-aurora--emerald" />
      <div className="ct-aurora ct-aurora--teal" />
      <div className="ct-aurora ct-aurora--blue" />
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <span key={n} className={`ct-float ct-float--${n}`} />
      ))}
    </div>
  );
}

const STEPS = [
  { title: "Nos cuentas tu caso", text: "Por el formulario, WhatsApp o teléfono." },
  { title: "Te respondemos", text: "Revisamos tu mensaje y te contactamos para conocer los detalles." },
  { title: "Recibes una propuesta", text: "Con alcance, plazos y precio por escrito." },
];

export default function ContactoPage() {
  const { bookingUrl, contactEmail } = publicConfig;
  return (
    <main className="relative isolate flex-1">
      <ContactBackground />
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-14 sm:px-6 lg:px-8">
        <section className="ct-rise text-center" aria-labelledby="contacto-title">
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-400/10 px-3.5 py-1.5 text-xs font-semibold text-blue-200">
            <span className="ct-pulse size-2 rounded-full bg-blue-400" />
            Contacto y presupuestos
          </p>
          <h1 id="contacto-title" className="mt-6 text-5xl font-bold tracking-tight text-white sm:text-6xl">
            Hablemos<span className="ct-gradient-text">.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-300">
            Cuéntanos qué necesitas y te respondemos con una propuesta clara. Elige el canal que prefieras.
          </p>

          <div className={`mx-auto mt-9 grid max-w-4xl gap-4 sm:grid-cols-2 ${bookingUrl || contactEmail ? "lg:grid-cols-3" : ""}`}>
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="ct-action group">
              <span className="ct-action__icon bg-emerald-500 text-emerald-950">
                <ChatPhoneIcon className="size-6" />
              </span>
              <span className="text-left">
                <span className="block text-sm font-semibold text-white">Abrir WhatsApp</span>
                <span className="block text-sm text-emerald-200/80">{PHONE_DISPLAY}</span>
              </span>
            </a>
            <a href={PHONE_HREF} className="ct-action group">
              <span className="ct-action__icon bg-white/10 text-blue-200">
                <PhoneIcon className="size-6" />
              </span>
              <span className="text-left">
                <span className="block text-sm font-semibold text-white">Llamar</span>
                <span className="block text-sm text-slate-400">{PHONE_DISPLAY}</span>
              </span>
            </a>
            {bookingUrl ? (
              <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="ct-action group">
                <span className="ct-action__icon bg-blue-600 text-white">
                  <CalendarIcon className="size-6" />
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold text-white">Reservar una reunión</span>
                  <span className="block text-sm text-slate-400">Elige día y hora</span>
                </span>
              </a>
            ) : contactEmail ? (
              <a href={`mailto:${contactEmail}`} className="ct-action group">
                <span className="ct-action__icon bg-white/10 text-blue-200">
                  <MailIcon className="size-6" />
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold text-white">Escribir un correo</span>
                  <span className="block text-sm text-slate-400">{contactEmail}</span>
                </span>
              </a>
            ) : null}
          </div>
        </section>

        <ol className="ct-rise ct-rise--late mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3" aria-label="Cómo trabajamos tu solicitud">
          {STEPS.map((step, index) => (
            <li key={step.title} className="ct-step flex items-start gap-3 rounded-2xl p-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-blue-400/40 text-sm font-semibold text-blue-300">
                {index + 1}
              </span>
              <span>
                <span className="block text-sm font-semibold text-white">{step.title}</span>
                <span className="block text-sm text-slate-400">{step.text}</span>
              </span>
            </li>
          ))}
        </ol>

        <section id="formulario" aria-label="Formulario de contacto" className="ct-rise ct-rise--later mx-auto mt-12 max-w-3xl scroll-mt-24">
          <Suspense fallback={<div className="ct-card min-h-[40rem] rounded-3xl" />}>
            <ContactForm />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
