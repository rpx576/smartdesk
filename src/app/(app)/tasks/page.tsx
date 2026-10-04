import type { Metadata } from "next";
import { ComingSoon } from "../_components/coming-soon";
import { CheckSquareIcon } from "../_components/icons";

export const metadata: Metadata = { title: "Tareas · SmartDesk" };

export default function TasksPage() {
  return (
    <ComingSoon
      title="Tareas"
      description="Reparte y controla el trabajo del día a día."
      icon={CheckSquareIcon}
      features={[
        "Asignar tareas a miembros del equipo",
        "Fechas límite y prioridades",
        "Ver las tareas pendientes desde el dashboard",
      ]}
    />
  );
}
