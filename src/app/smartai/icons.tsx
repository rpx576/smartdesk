import type { JSX, SVGProps } from "react";
import type { AssistantId } from "@/lib/smartai";

type IconProps = SVGProps<SVGSVGElement>;

/** Stroke icons of the SmartAI page and studio. */
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

export const SparklesIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.5 13.6 8a2 2 0 0 0 1.2 1.2L19.5 11l-4.7 1.7a2 2 0 0 0-1.2 1.2L12 18.5l-1.6-4.6a2 2 0 0 0-1.2-1.2L4.5 11l4.7-1.8A2 2 0 0 0 10.4 8Z" />
    <path d="M19 3v3M20.5 4.5h-3M5 17.5v3M6.5 19h-3" />
  </Icon>
);

export const ReceiptIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z" />
    <path d="M9 8h6M9 12h6M9 16h3" />
  </Icon>
);

export const ChatIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12Z" />
    <path d="M8.5 11h7M8.5 14.5h4" />
  </Icon>
);

export const ListCheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m4 6.5 1.5 1.5L8.5 5M4 13.5l1.5 1.5 3-3M4 20h4.5" />
    <path d="M12 6.5h8M12 13.5h8M12 20h8" />
  </Icon>
);

export const MegaphoneIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 10v4a1 1 0 0 0 1 1h2l8 4V5L7 9H5a1 1 0 0 0-1 1Z" />
    <path d="M18 9.5a3.5 3.5 0 0 1 0 5M8 15l1.5 5h2.5l-1.3-4.3" />
  </Icon>
);

export const StarIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z" />
  </Icon>
);

export const CopyIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
  </Icon>
);

export const DownloadIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />
  </Icon>
);

export const RefreshIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 11a8 8 0 0 0-14.3-4.5L4 8.5M4 4v4.5h4.5M4 13a8 8 0 0 0 14.3 4.5l1.7-2M20 20v-4.5h-4.5" />
  </Icon>
);

export const StopIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </Icon>
);

export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);

export const SendIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M21 3 10 14M21 3l-7 18-4-7-7-4Z" />
  </Icon>
);

export const BuildingIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M3 21h18" />
    <path d="M8 8h3M8 12h3M8 16h3" />
  </Icon>
);

export const ClockIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
);

export const ShieldIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3 5 6v5.5c0 4.3 3 8 7 9.5 4-1.5 7-5.2 7-9.5V6Z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
);

export const PlugIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 3v4M15 3v4M7 7h10v4a5 5 0 0 1-10 0ZM12 16v5" />
  </Icon>
);

export const assistantIcons: Record<AssistantId, (p: IconProps) => JSX.Element> = {
  presupuesto: ReceiptIcon,
  respuesta: ChatIcon,
  resumen: ListCheckIcon,
  marketing: MegaphoneIcon,
  resena: StarIcon,
};
