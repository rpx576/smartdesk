import { BoltIcon, ChartIcon, LockIcon, SmartDeskMark } from "@/app/_access/access-icons";
import { AccessShell } from "@/app/_access/access-shell";

const highlights = [
  { icon: ChartIcon, label: "Todo tu negocio en un solo lugar", tile: "bg-blue-100 text-blue-600" },
  { icon: LockIcon, label: "Seguro y confiable", tile: "bg-indigo-100 text-indigo-600" },
  { icon: BoltIcon, label: "Diseñado para crecer contigo", tile: "bg-violet-100 text-violet-600" },
];

/** SmartDesk entry screens. There are no SmartDesk accounts: people use SmartHub's. */
export default function SmartDeskAccessLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccessShell
      accent="Desk"
      eyebrow="SmartHub"
      tagline="Tu empresa, más organizada y productiva."
      description="Gestiona clientes, proyectos, tareas y mucho más desde un único lugar, con la tecnología de SmartHub."
      highlights={highlights}
      mark={SmartDeskMark}
      subtitle="de SmartHub"
    >
      {children}
    </AccessShell>
  );
}
