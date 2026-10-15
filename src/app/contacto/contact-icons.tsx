import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Stroke icons of the contact page. */
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

/** Chat bubble with a handset: stands for WhatsApp without copying its logo. */
export const ChatPhoneIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.2 19.8 5.3 16A8.5 8.5 0 1 1 8 18.7Z" />
    <path d="M9.2 8.6c.2-.4.6-.6 1-.4l.8.4c.3.2.4.6.3.9l-.4.9a5.6 5.6 0 0 0 2.7 2.7l.9-.4c.3-.1.7 0 .9.3l.4.8c.2.4 0 .8-.4 1-1.6.9-3.5.1-4.7-1.1S8.3 10.2 9.2 8.6Z" />
  </Icon>
);

export const PhoneIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 4h3.2l1.6 4-2 1.3a10.5 10.5 0 0 0 4.9 4.9l1.3-2 4 1.6V17a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </Icon>
);

export const SendIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 12 20 4l-6 16-3-7Z" />
    <path d="m11 13 9-9" />
  </Icon>
);

export const UserIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </Icon>
);

export const BuildingIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M15 9h3a1 1 0 0 1 1 1v11M3 21h18" />
    <path d="M9 8h2M9 12h2M9 16h2" />
  </Icon>
);

export const MailIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </Icon>
);

export const DoubleCheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m2.5 12.5 4 4 8-9M10.5 15.5l1 1 8-9" />
  </Icon>
);
