import type { Metadata } from "next";
import { ComingSoon } from "../_components/coming-soon";
import { FolderIcon } from "../_components/icons";

export const metadata: Metadata = { title: "Proyectos · SmartDesk" };

export default function ProjectsPage() {
  return (
    <ComingSoon
      title="Proyectos"
      description="Organiza el trabajo que haces para cada cliente."
      icon={FolderIcon}
      features={[
        "Crear proyectos asociados a tus clientes",
        "Seguir su estado, fechas y responsables",
        "Ver de un vistazo los proyectos activos en el dashboard",
      ]}
    />
  );
}
