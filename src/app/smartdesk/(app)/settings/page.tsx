import type { Metadata } from "next";
import { ComingSoon } from "../_components/coming-soon";
import { SettingsIcon } from "../_components/icons";

export const metadata: Metadata = { title: "Configuración · SmartDesk" };

export default function SettingsPage() {
  return (
    <ComingSoon
      title="Configuración"
      description="Ajustes de tu organización y de tu cuenta."
      icon={SettingsIcon}
      features={[
        "Datos de la organización",
        "Invitar usuarios y gestionar sus roles",
        "Preferencias de tu perfil y contraseña",
      ]}
    />
  );
}
