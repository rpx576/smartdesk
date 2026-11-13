import { SERVICES } from "./services";

/** Options of the contact form, shared by the browser and the server (no validation library here, to keep the page light). */
export const SERVICE_OPTIONS = [...SERVICES.map((service) => ({ id: service.id as string, label: service.name })), { id: "otro", label: "Otro" }];
export const REQUEST_TYPES = { contacto: "Consulta", presupuesto: "Solicitud de presupuesto" } as const;
export const BUDGETS = {
  "menos-1000": "Menos de 1.000 €",
  "1000-3000": "Entre 1.000 y 3.000 €",
  "3000-6000": "Entre 3.000 y 6.000 €",
  "mas-6000": "Más de 6.000 €",
  "no-se": "Todavía no lo sé",
} as const;
export const DEADLINES = {
  urgente: "Lo antes posible",
  "1-3-meses": "En 1 a 3 meses",
  "sin-prisa": "Sin prisa",
} as const;

export const NAME_MAX = 80;
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 2000;

export function serviceLabel(id: string): string {
  return SERVICE_OPTIONS.find((option) => option.id === id)?.label ?? "Otro";
}
