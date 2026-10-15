import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Stroke({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/** SmartDesk logo: three stacked layers. */
export function SmartDeskMark(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="sd-mark" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60a5fa" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <path d="M24 5 42 14 24 23 6 14Z" fill="url(#sd-mark)" />
      <path d="M6 23.5 24 32.5 42 23.5" stroke="url(#sd-mark)" strokeWidth="4.5" strokeLinejoin="round" opacity="0.75" />
      <path d="M6 33 24 42 42 33" stroke="url(#sd-mark)" strokeWidth="4.5" strokeLinejoin="round" opacity="0.5" />
    </svg>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M5 20V10M10 20V4M15 20v-7M20 20V8" strokeWidth={2.4} />
    </Stroke>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      <path d="M12 14.5v2" />
    </Stroke>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.5 2 4.5 13.5h6L9.5 22l9-11.5h-6L13.5 2Z" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m4.5 7 7.5 6 7.5-6" />
    </Stroke>
  );
}

export function BuildingIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M4.5 20.5V5.5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v15M14.5 9.5h4a1 1 0 0 1 1 1v10M3 20.5h18" />
      <path d="M8 8.5h3M8 12h3M8 15.5h3" />
    </Stroke>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Stroke>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M10.6 5.6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16.6 16.6 0 0 1-2.9 3.7M6.6 6.6C3.9 8.3 2.5 12 2.5 12S6 18.5 12 18.5c1.9 0 3.5-.6 4.9-1.5" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3.5 3.5l17 17" />
    </Stroke>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Stroke>
  );
}

/** SmartHub logo: a hub joined to its products. */
export function SmartHubMark(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="sh-mark" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60a5fa" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <path d="M24 24 10 12M24 24l14-12M24 24v16" stroke="url(#sh-mark)" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <circle cx="24" cy="24" r="8" fill="url(#sh-mark)" />
      <circle cx="10" cy="12" r="5" fill="url(#sh-mark)" opacity="0.8" />
      <circle cx="38" cy="12" r="5" fill="url(#sh-mark)" opacity="0.8" />
      <circle cx="24" cy="40" r="5" fill="url(#sh-mark)" opacity="0.8" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </Stroke>
  );
}

export function DeskIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect x="3.5" y="4.5" width="17" height="12" rx="2" />
      <path d="M8.5 20.5h7M12 16.5v4" />
    </Stroke>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12 3.5 13.8 9 19.5 10.5 13.8 12 12 17.5 10.2 12 4.5 10.5 10.2 9Z" />
      <path d="M18.5 16v4M16.5 18h4" />
    </Stroke>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5Z" />
    </Stroke>
  );
}
