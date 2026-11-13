import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Stroke icons of the website (24×24 grid), decorative unless labelled by the caller. */
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

export const ChevronDownIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m6 9.5 6 6 6-6" />
  </Icon>
);

export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);

export const ShieldCheckIcon =(p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.5 19 6v5.5c0 4.3-2.9 7.6-7 9-4.1-1.4-7-4.7-7-9V6Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </Icon>
);

export const RocketIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14.5 4.5c2.8-.9 5-.9 5-.9s0 2.2-.9 5L13 14.2 9.8 11Z" />
    <path d="M9.8 11 6.5 10.5 4 13l3.6 1M13 14.2l.5 3.3L11 20l-1-3.6M7.6 14l2.4 2.4M5.5 18.5l2-2" />
  </Icon>
);

export const GlobeIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.25" />
    <path d="M3.75 12h16.5M12 3.75c2.2 2.3 3.3 5 3.3 8.25S14.2 18 12 20.25C9.8 18 8.7 15.3 8.7 12S9.8 6 12 3.75Z" />
  </Icon>
);

export const ChartIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 20V12M10 20V8M15 20v-6M20 20V4" />
  </Icon>
);

export const HomeTabIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 10.5 12 4l8 6.5" />
    <path d="M6 9.5V19a1 1 0 0 0 1 1h3.5v-5h3v5H17a1 1 0 0 0 1-1V9.5" />
  </Icon>
);

export const GridIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </Icon>
);

export const BookIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H19v13.5H6.5A1.5 1.5 0 0 0 5 19Z" />
    <path d="M5 19a1.5 1.5 0 0 0 1.5 1.5H19V17.5M9 8h6M9 11.5h4" />
  </Icon>
);

export const DotsIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="6" cy="12" r="1.25" fill="currentColor" />
    <circle cx="12" cy="12" r="1.25" fill="currentColor" />
    <circle cx="18" cy="12" r="1.25" fill="currentColor" />
  </Icon>
);

export const MailIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="m4 7.5 8 5.5 8-5.5" />
  </Icon>
);

export const UsersIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="9" cy="8.5" r="3.25" />
    <path d="M3.5 19c.6-3 2.8-4.75 5.5-4.75S13.9 16 14.5 19" />
    <path d="M15.5 5.6a3.25 3.25 0 0 1 0 5.8" />
    <path d="M17.2 14.6c1.6.6 2.8 2.1 3.3 4.4" />
  </Icon>
);

export const MenuIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5" />
  </Icon>
);

export const CheckCircleIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.25" />
    <path d="m8.5 12.25 2.4 2.4 4.6-5" />
  </Icon>
);


export const CodeIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
    <path d="M3 8.5h18M9.5 12.5l-2 2 2 2M14.5 12.5l2 2-2 2" />
  </Icon>
);

export const WrenchIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14.7 6.3a4 4 0 0 0 5 5L21 12.6a6 6 0 0 1-7.6 1.9L7 20.9a2 2 0 1 1-2.9-2.9l6.4-6.4A6 6 0 0 1 12.4 4l1.3 1.3a4 4 0 0 0 1 1Z" />
  </Icon>
);

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6" />
    <path d="m20 20-4.5-4.5" />
  </Icon>
);

export const TrendingIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m3.5 17 6-6 4 4 7-7.5" />
    <path d="M15 7.5h5.5V13" />
  </Icon>
);

export const LockIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2" />
  </Icon>
);

export const AlertIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10.3 4.2 2.9 17.5A2 2 0 0 0 4.6 20.5h14.8a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9.5v4M12 17h.01" />
  </Icon>
);

export const ClockIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
);

export const PhoneIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 4.5h3.5l1.5 4-2 1.25a11 11 0 0 0 6.25 6.25L15.5 14l4 1.5V19a1.5 1.5 0 0 1-1.5 1.5A15 15 0 0 1 3.5 6 1.5 1.5 0 0 1 5 4.5Z" />
  </Icon>
);

export const WhatsAppIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 20l1.2-3.6A8 8 0 1 1 8 19.1Z" />
    <path d="M9 8.8c0 3 2.6 5.9 5.8 6.2l1.2-1.3-1.8-1-1 .8a4.8 4.8 0 0 1-2.4-2.4l.8-1-1-1.8Z" />
  </Icon>
);

export const CalendarIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
  </Icon>
);

export const LayersIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m12 3 8.5 4.5L12 12 3.5 7.5Z" />
    <path d="m3.5 12 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5" />
  </Icon>
);

export const MessageIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 5.5h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4.5 3.5V6.5a1 1 0 0 1 1-1Z" />
    <path d="M8 10h8M8 13h5" />
  </Icon>
);

export const FileIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6.5 3h7.5l4.5 4.5V20a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
    <path d="M13.5 3v5h5M9 13h6M9 16.5h6" />
  </Icon>
);
