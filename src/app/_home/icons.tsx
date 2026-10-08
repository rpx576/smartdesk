import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Extra stroke icons for the SmartHub website (the app ones live in (app)/_components/icons). */
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

export const LogoIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m12 3 8.5 4.5L12 12 3.5 7.5Z" />
    <path d="m3.5 12 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5" />
  </Icon>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m6 9.5 6 6 6-6" />
  </Icon>
);

export const ShieldCheckIcon = (p: IconProps) => (
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

export const BotIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="5" y="8" width="14" height="11" rx="3" />
    <path d="M12 8V4.5M9.5 13h.01M14.5 13h.01M9.5 16h5M3 12.5v2M21 12.5v2" />
  </Icon>
);

export const DeskIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.75" y="4.5" width="16.5" height="12" rx="2" />
    <path d="M8 20h8M12 16.5V20M7.5 9h9M7.5 12h5" />
  </Icon>
);

export const ChartIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 20V12M10 20V8M15 20v-6M20 20V4" />
  </Icon>
);

export const StarIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...p}>
    <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z" />
  </svg>
);