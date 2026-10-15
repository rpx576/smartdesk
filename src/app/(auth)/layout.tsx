import { DeskIcon, GlobeIcon, SmartHubMark, SparklesIcon } from "@/app/_access/access-icons";
import { AccessShell } from "@/app/_access/access-shell";

const highlights = [
  { icon: DeskIcon, label: "SmartDesk: clientes, proyectos y tareas", tile: "bg-blue-100 text-blue-600" },
  { icon: SparklesIcon, label: "SmartAI: automatización e inteligencia artificial", tile: "bg-indigo-100 text-indigo-600" },
  { icon: GlobeIcon, label: "SmartWeb: webs, tiendas online y landing pages", tile: "bg-violet-100 text-violet-600" },
];

/** SmartHub account screens: sign-in, sign-up and the account page. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccessShell
      accent="Hub"
      eyebrow="Una cuenta para todo"
      tagline="Todas tus soluciones digitales, en un solo lugar."
      description="Con tu cuenta SmartHub entras en SmartDesk y en el resto de productos, sin registrarte otra vez."
      highlights={highlights}
      mark={SmartHubMark}
      subtitle="Tu cuenta para todos los productos"
    >
      {children}
    </AccessShell>
  );
}
