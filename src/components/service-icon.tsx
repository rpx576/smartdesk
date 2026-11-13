import type { ComponentType, SVGProps } from "react";
import type { ServiceId } from "@/content/services";
import { CodeIcon, ShieldCheckIcon, TrendingIcon, WrenchIcon } from "./icons";

/** Icon of each service, shared by the menu, the home and the service pages. */
export const SERVICE_ICONS: Record<ServiceId, ComponentType<SVGProps<SVGSVGElement>>> = {
  "creacion-web": CodeIcon,
  "mantenimiento-web": WrenchIcon,
  seo: TrendingIcon,
  ciberseguridad: ShieldCheckIcon,
};
