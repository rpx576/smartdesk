import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../_home/site-header";
import { ChatPhoneIcon, PhoneIcon } from "./contact-icons";
import { ContactForm } from "./contact-form";
import { PHONE_HREF, WHATSAPP_DISPLAY, whatsappUrl } from "./whatsapp";
import "./contacto.css";

export const metadata: Metadata = {
  title: "Contacto · SmartHub",
  description: "Escríbenos por WhatsApp al " + WHATSAPP_DISPLAY + " o déjanos tu mensaje y te respondemos.",
};

const steps = [
  { title: "Rellena el formulario", text: "Nombre, asunto y lo que necesitas." },
  { title: "Se abre WhatsApp", text: "Con tu mensaje ya escrito en nuestro chat." },
  { title: "Pulsa enviar", text: "Y seguimos la conversación por WhatsApp." },
];

/** Decorative background of the contact page: aurora, dot grid and rising chat bubbles. */
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

/** Contact page (only linked from the "Contacto" options of the main menu). */
export default function ContactPage() {
  return (
    <div className="relative isolate flex min-h-dvh flex-1 flex-col bg-[#030b0d] font-sans text-slate-100">
      <ContactBackground />
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-14 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5 text-sm font-medium text-slate-300 outline-none transition-colors hover:border-emerald-400/40 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400/60"
        >
          <span aria-hidden="true">←</span>
          Volver al inicio
        </Link>

        <section className="ct-rise text-center" aria-labelledby="contacto-title">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-200">
            <span className="ct-pulse size-2 rounded-full bg-emerald-400" />
            Atención directa por WhatsApp
          </p>
          <h1 id="contacto-title" className="mt-6 text-5xl font-bold tracking-tight text-white sm:text-6xl">
            Hablemos<span className="ct-gradient-text">.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-300">
            Sin formularios que se pierden en un buzón: tu mensaje llega a nuestro WhatsApp y te contestamos por
            el mismo chat.
          </p>

          <div className="mx-auto mt-9 grid max-w-2xl gap-4 sm:grid-cols-2">
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="ct-action group">
              <span className="ct-action__icon bg-emerald-500 text-emerald-950">
                <ChatPhoneIcon className="size-6" />
              </span>
              <span className="text-left">
                <span className="block text-sm font-semibold text-white">Abrir chat de WhatsApp</span>
                <span className="block text-sm text-emerald-200/80">{WHATSAPP_DISPLAY}</span>
              </span>
            </a>
            <a href={PHONE_HREF} className="ct-action group">
              <span className="ct-action__icon bg-white/10 text-emerald-200">
                <PhoneIcon className="size-6" />
              </span>
              <span className="text-left">
                <span className="block text-sm font-semibold text-white">Llamar ahora</span>
                <span className="block text-sm text-slate-400">{WHATSAPP_DISPLAY}</span>
              </span>
            </a>
          </div>
        </section>

        <ol className="ct-rise ct-rise--late mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3" aria-label="Cómo funciona">
          {steps.map((step, index) => (
            <li key={step.title} className="ct-step flex items-start gap-3 rounded-2xl p-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-emerald-400/40 text-sm font-semibold text-emerald-300">
                {index + 1}
              </span>
              <span>
                <span className="block text-sm font-semibold text-white">{step.title}</span>
                <span className="block text-sm text-slate-400">{step.text}</span>
              </span>
            </li>
          ))}
        </ol>

        <section id="formulario" aria-label="Formulario de contacto" className="ct-rise ct-rise--later mt-12 scroll-mt-24">
          <ContactForm />
        </section>
      </main>
    </div>
  );
}
