import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const I = ({ size = 20, children, className = '', ...rest }: IconProps & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={'icon ' + className}
    {...rest}
  >
    {children}
  </svg>
);

export const LogoMark = ({
  size = 28,
  accent = 'var(--accent)',
  ink = '#1a0d05',
  ...rest
}: SVGProps<SVGSVGElement> & { size?: number; accent?: string; ink?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...rest}>
    <rect x="0" y="0" width="32" height="32" rx="8" fill={accent} />
    <path d="M7 11 H13 L15 13 H25" stroke={ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 11 V23 H25 V13" stroke={ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 18 H17" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="20" cy="18" r="1.4" fill={ink} />
  </svg>
);

export const IconFolder = (p: IconProps) => (
  <I {...p}>
    <path d="M3 7 V18 a2 2 0 0 0 2 2 H19 a2 2 0 0 0 2 -2 V9 a2 2 0 0 0 -2 -2 H12 L10 5 H5 a2 2 0 0 0 -2 2 Z" />
  </I>
);

export const IconInstructions = (p: IconProps) => (
  <I {...p}>
    <path d="M6 3 H16 L19 6 V21 H6 Z" />
    <path d="M9 9 H16" />
    <path d="M9 13 H16" />
    <path d="M9 17 H13" />
  </I>
);

export const IconTool = (p: IconProps) => (
  <I {...p}>
    <path d="M14.7 6.3 a3.5 3.5 0 1 0 3 3 L21 6 V3 H18 L14.7 6.3 Z" />
    <path d="M13.5 10.5 L4.5 19.5 a2.12 2.12 0 0 1 -3 -3 L10.5 7.5" />
  </I>
);

export const IconCompass = (p: IconProps) => (
  <I {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M15.5 8.5 L13.5 13.5 L8.5 15.5 L10.5 10.5 Z" />
  </I>
);

export const IconBook = (p: IconProps) => (
  <I {...p}>
    <path d="M4 4 H12 a3 3 0 0 1 3 3 V20 a3 3 0 0 0 -3 -3 H4 Z" />
    <path d="M20 4 H12 a3 3 0 0 0 -3 3 V20 a3 3 0 0 1 3 -3 H20 Z" />
  </I>
);

export const IconUsers = (p: IconProps) => (
  <I {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20 c0 -3.3 2.5 -5.5 5.5 -5.5 s5.5 2.2 5.5 5.5" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M14.5 14.6 c0.7 -0.4 1.6 -0.6 2.5 -0.6 c2.4 0 4.5 1.7 4.5 4.5" />
  </I>
);

export const IconWrench = (p: IconProps) => (
  <I {...p}>
    <path d="M14 7 a4 4 0 0 1 5.5 5.5 L11 21 H6 V16 Z" />
    <path d="M14 11 L17 14" />
  </I>
);

export const IconShield = (p: IconProps) => (
  <I {...p}>
    <path d="M12 3 L20 6 V12 c0 5 -4 8 -8 9 c-4 -1 -8 -4 -8 -9 V6 Z" />
  </I>
);

export const IconGraph = (p: IconProps) => (
  <I {...p}>
    <path d="M3 19 H21" />
    <path d="M6 16 V11" />
    <path d="M11 16 V7" />
    <path d="M16 16 V13" />
    <path d="M21 16 V5" />
  </I>
);

export const IconSpark = (p: IconProps) => (
  <I {...p}>
    <path d="M12 3 L13.5 9.5 L20 11 L13.5 12.5 L12 19 L10.5 12.5 L4 11 L10.5 9.5 Z" />
  </I>
);

export const IconArrow = ({ size = 14, ...rest }: IconProps) => (
  <I size={size} {...rest}>
    <path d="M5 12 H19" />
    <path d="M13 6 L19 12 L13 18" />
  </I>
);

export const IconCheck = (p: IconProps) => (
  <I {...p}>
    <path d="M5 13 L10 18 L20 6" />
  </I>
);

export const IconX = (p: IconProps) => (
  <I {...p}>
    <path d="M6 6 L18 18" />
    <path d="M18 6 L6 18" />
  </I>
);

export const IconPlus = (p: IconProps) => (
  <I {...p}>
    <path d="M12 5 V19" />
    <path d="M5 12 H19" />
  </I>
);

export const IconMail = (p: IconProps) => (
  <I {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7 L12 13 L21 7" />
  </I>
);

export const IconPhone = (p: IconProps) => (
  <I {...p}>
    <path d="M5 4 H9 L11 9 L8.5 11 a11 11 0 0 0 4.5 4.5 L15 13 L20 15 V19 a2 2 0 0 1 -2 2 C10.5 21 3 13.5 3 6 a2 2 0 0 1 2 -2 Z" />
  </I>
);

export const IconPin = (p: IconProps) => (
  <I {...p}>
    <path d="M12 22 c-4.5 -5 -7 -8 -7 -12 a7 7 0 0 1 14 0 c0 4 -2.5 7 -7 12 Z" />
    <circle cx="12" cy="10" r="2.5" />
  </I>
);

export const IconGithub = (p: IconProps) => (
  <I {...p}>
    <path d="M9 19 c-4 1.3 -4 -2 -6 -2 m12 4 v-3.5 a3 3 0 0 0 -1 -2.5 c3 -.3 6 -1.5 6 -6.5 a5 5 0 0 0 -1.5 -3.5 a4.5 4.5 0 0 0 -.1 -3.5 s-1.2 -.3 -3.9 1.5 a13 13 0 0 0 -7 0 c-2.7 -1.8 -3.9 -1.5 -3.9 -1.5 a4.5 4.5 0 0 0 -.1 3.5 a5 5 0 0 0 -1.5 3.5 c0 5 3 6.2 6 6.5 a3 3 0 0 0 -1 2.5 V21" />
  </I>
);

export const IconTerminal = (p: IconProps) => (
  <I {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 9 L10 12 L7 15" />
    <path d="M12 16 H17" />
  </I>
);

export const IconCode = (p: IconProps) => (
  <I {...p}>
    <path d="M8 7 L3 12 L8 17" />
    <path d="M16 7 L21 12 L16 17" />
    <path d="M14 5 L10 19" />
  </I>
);

export const IconClock = (p: IconProps) => (
  <I {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7 V12 L15 14" />
  </I>
);

export const IconLock = (p: IconProps) => (
  <I {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11 V8 a4 4 0 0 1 8 0 V11" />
  </I>
);

export const IconSettings = (p: IconProps) => (
  <I {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15 a1.7 1.7 0 0 0 .3 1.8 l.1 .1 a2 2 0 1 1 -2.8 2.8 l-.1 -.1 a1.7 1.7 0 0 0 -1.8 -.3 a1.7 1.7 0 0 0 -1 1.5 V21 a2 2 0 0 1 -4 0 v-.1 a1.7 1.7 0 0 0 -1.1 -1.5 a1.7 1.7 0 0 0 -1.8 .3 l-.1 .1 a2 2 0 1 1 -2.8 -2.8 l.1 -.1 a1.7 1.7 0 0 0 .3 -1.8 a1.7 1.7 0 0 0 -1.5 -1 H3 a2 2 0 0 1 0 -4 h.1 a1.7 1.7 0 0 0 1.5 -1.1 a1.7 1.7 0 0 0 -.3 -1.8 l-.1 -.1 a2 2 0 1 1 2.8 -2.8 l.1 .1 a1.7 1.7 0 0 0 1.8 .3 H9 a1.7 1.7 0 0 0 1 -1.5 V3 a2 2 0 0 1 4 0 v.1 a1.7 1.7 0 0 0 1 1.5 a1.7 1.7 0 0 0 1.8 -.3 l.1 -.1 a2 2 0 1 1 2.8 2.8 l-.1 .1 a1.7 1.7 0 0 0 -.3 1.8 V9 a1.7 1.7 0 0 0 1.5 1 H21 a2 2 0 0 1 0 4 h-.1 a1.7 1.7 0 0 0 -1.5 1 Z" />
  </I>
);

export const IconLayers = (p: IconProps) => (
  <I {...p}>
    <path d="M12 3 L21 8 L12 13 L3 8 Z" />
    <path d="M3 13 L12 18 L21 13" />
    <path d="M3 18 L12 23 L21 18" />
  </I>
);

export const IconTarget = (p: IconProps) => (
  <I {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" />
  </I>
);

export const IconChat = (p: IconProps) => (
  <I {...p}>
    <path d="M21 12 a8 8 0 0 1 -11.6 7.1 L4 21 l1.9 -5.4 A8 8 0 1 1 21 12 Z" />
  </I>
);

export const IconBolt = (p: IconProps) => (
  <I {...p}>
    <path d="M13 3 L4 14 H11 L10 21 L20 10 H13 Z" />
  </I>
);

export const IconSearch = (p: IconProps) => (
  <I {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M16 16 L21 21" />
  </I>
);

export const IconNotes = (p: IconProps) => (
  <I {...p}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 8 H16" />
    <path d="M8 12 H16" />
    <path d="M8 16 H13" />
  </I>
);

export const IconBracket = (p: IconProps) => (
  <I {...p}>
    <path d="M9 4 H6 a2 2 0 0 0 -2 2 V18 a2 2 0 0 0 2 2 H9" />
    <path d="M15 4 H18 a2 2 0 0 1 2 2 V18 a2 2 0 0 1 -2 2 H15" />
  </I>
);
