import type { ComponentType, SVGProps } from "react";
import {
  CalendarIcon,
  CheckSquareIcon,
  DocumentIcon,
  FolderIcon,
  HomeIcon,
  SettingsIcon,
  UsersIcon,
} from "./icons";

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Module not built yet: the link opens a "coming soon" page. */
  comingSoon?: boolean;
};

export const mainNavigation: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/clients", label: "Clientes", icon: UsersIcon },
  { href: "/projects", label: "Proyectos", icon: FolderIcon },
  { href: "/tasks", label: "Tareas", icon: CheckSquareIcon },
  { href: "/calendar", label: "Calendario", icon: CalendarIcon, comingSoon: true },
  { href: "/documents", label: "Documentos", icon: DocumentIcon, comingSoon: true },
];

export const secondaryNavigation: NavItem[] = [
  { href: "/settings", label: "Configuración", icon: SettingsIcon, comingSoon: true },
];

const allItems = [...mainNavigation, ...secondaryNavigation];

/** Nav item that owns the given path (also matches nested routes such as /clients/123). */
export function findNavItem(pathname: string): NavItem | undefined {
  return allItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}
