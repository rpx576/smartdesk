import type { Metadata } from "next";
import { ComingSoon } from "../_components/coming-soon";
import { CalendarIcon } from "../_components/icons";

export const metadata: Metadata = { title: "Calendario · SmartDesk" };

export default function CalendarPage() {
  return (
    <ComingSoon
      title="Calendario"
      description="Reuniones, entregas y vencimientos en un solo lugar."
      icon={CalendarIcon}
      features={[
        "Ver fechas de proyectos y tareas en el calendario",
        "Programar reuniones con clientes",
        "Vista semanal y mensual del equipo",
      ]}
    />
  );
}
