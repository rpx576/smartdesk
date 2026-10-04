import type { Metadata } from "next";
import { ComingSoon } from "../_components/coming-soon";
import { DocumentIcon } from "../_components/icons";

export const metadata: Metadata = { title: "Documentos · SmartDesk" };

export default function DocumentsPage() {
  return (
    <ComingSoon
      title="Documentos"
      description="Presupuestos, contratos y facturas organizados por cliente."
      icon={DocumentIcon}
      features={[
        "Subir y organizar documentos por cliente o proyecto",
        "Controlar quién puede verlos según su rol",
        "Encontrarlos rápido con la búsqueda",
      ]}
    />
  );
}
