/**
 * Main menu of the SmartHub website. An item without `href` is not built yet
 * and is shown as "Pronto" (no link to a page that does not exist).
 */
export type MenuItem = { label: string; description?: string; href?: string };
export type NavEntry = { label: string; href?: string; items?: MenuItem[] };

/** SmartDesk, the management tool: its own section, entered with the SmartHub account. */
export const SMARTDESK_HREF = "/smartdesk";

export const siteNavigation: NavEntry[] = [
  { label: "Inicio", href: "#inicio" },
  { label: "Soluciones", href: "#soluciones" },
  {
    label: "Productos",
    items: [
      {
        label: "SmartDesk",
        description: "Gestión empresarial: clientes, proyectos, tareas y calendario",
        href: SMARTDESK_HREF,
      },
      { label: "SmartAI", description: "Automatización e inteligencia artificial" },
      { label: "SmartWeb", description: "Páginas web, tiendas online y landing pages" },
    ],
  },
  { label: "Precios" },
  {
    label: "Recursos",
    items: [{ label: "Blog" }, { label: "Guías" }, { label: "Centro de ayuda" }],
  },
  {
    label: "Empresa",
    items: [
      { label: "Sobre nosotros" },
      { label: "Opiniones de clientes", href: "#opiniones" },
      { label: "Contacto", href: "#contacto" },
    ],
  },
  { label: "Contacto", href: "#contacto" },
];