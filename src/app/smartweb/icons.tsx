import type { JSX, SVGProps } from "react";
import type { ExtraId, ModuleId } from "@/lib/smartweb";

type IconProps = SVGProps<SVGSVGElement>;

/** Stroke icons of the SmartWeb page and studio. */
function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const MonitorIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </Icon>
);

export const SmartphoneIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
    <path d="M11 18.5h2" />
  </Icon>
);

export const ShuffleIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M16 4h4v4M20 4l-6.5 6.5M4 20l6-6M16 20h4v-4M20 20 4 4" />
  </Icon>
);

export const WandIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m4 20 11-11M14 4v2M19 9h2M17.5 5.5 19 4M17.5 9.5 19 11M10 5.5 11.5 7" />
    <path d="m13 7 4 4" />
  </Icon>
);

export const ChatBubbleIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 19.5 5.3 16A8 8 0 1 1 8 18.7Z" />
    <path d="M9 10.5c.5 1.6 1.9 3 3.5 3.5l1.2-1 2 .8v1.4c-3.6.3-7.3-3.4-7-7h1.4l.8 2Z" />
  </Icon>
);

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.4-4.4" />
  </Icon>
);

export const StarIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z" />
  </Icon>
);

export const ImageIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="m20.5 16-5-5-8.5 8.5" />
  </Icon>
);

export const PenIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 20h4L19 9a2.1 2.1 0 0 0-4-4L4 16Z" />
    <path d="m13.5 6.5 4 4" />
  </Icon>
);

export const CalendarIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M12 14h2" />
  </Icon>
);

export const CartIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 4h2l2.2 10.5a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6" />
    <circle cx="9.5" cy="19.5" r="1.2" />
    <circle cx="17" cy="19.5" r="1.2" />
  </Icon>
);

export const CardIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="M3 10h18M7 15h3" />
  </Icon>
);

export const LanguageIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.4 2.6 3.5 5.4 3.5 8.5s-1.1 5.9-3.5 8.5c-2.4-2.6-3.5-5.4-3.5-8.5s1.1-5.9 3.5-8.5Z" />
  </Icon>
);

export const LinkIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </Icon>
);

export const BotIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4.5" y="8" width="15" height="11" rx="3" />
    <path d="M12 4v4M9.5 13h.01M14.5 13h.01M9.5 16h5" />
  </Icon>
);

export const FileTextIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </Icon>
);

export const BrushIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14.5 4.5 19.5 9.5l-7.7 7.7-5-5Z" />
    <path d="M6.8 12.2C4 12.5 4 15 3.5 20c4.5-.3 7.5-.6 8.3-2.8" />
  </Icon>
);

export const CameraIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13" r="3.5" />
  </Icon>
);

export const BoltIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13 3 5 13.5h6L10 21l8-10.5h-6Z" />
  </Icon>
);

export const GaugeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 17a8.5 8.5 0 1 1 15 0" />
    <path d="m12 13 4-4" />
  </Icon>
);

export const LockIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </Icon>
);

export const ChartIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 20V4M4 20h16" />
    <path d="m8 15 3.5-4 3 2.5L19 8" />
  </Icon>
);

export const LayersIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8Z" />
    <path d="m3.5 12 8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5" />
  </Icon>
);

export const moduleIcons: Record<ModuleId, (p: IconProps) => JSX.Element> = {
  whatsapp: ChatBubbleIcon,
  seo: SearchIcon,
  resenas: StarIcon,
  galeria: ImageIcon,
  blog: FileTextIcon,
  multidioma: LanguageIcon,
  reservas: CalendarIcon,
  tienda: CartIcon,
  pagos: CardIcon,
  smartdesk: LinkIcon,
  smartai: BotIcon,
};

export const extraIcons: Record<ExtraId, (p: IconProps) => JSX.Element> = {
  textos: PenIcon,
  logo: BrushIcon,
  fotos: CameraIcon,
};
