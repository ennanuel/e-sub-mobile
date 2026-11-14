/** Line icons used across the app (24px grid, stroke follows currentColor unless noted). */
import type { ReactNode, SVGProps } from 'react';
import type { AmenityIcon } from '@/lib/api/types';

type IconProps = SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number };

function Line({ size = 20, strokeWidth = 2, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const ChevronLeft = (p: IconProps) => (
  <Line {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Line>
);
export const ChevronRight = (p: IconProps) => (
  <Line {...p}>
    <path d="M9 6l6 6-6 6" />
  </Line>
);
export const ChevronDown = (p: IconProps) => (
  <Line {...p}>
    <path d="M6 9l6 6 6-6" />
  </Line>
);
export const ArrowRight = (p: IconProps) => (
  <Line {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Line>
);
export const Share = (p: IconProps) => (
  <Line {...p}>
    <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" />
  </Line>
);
export const Phone = (p: IconProps) => (
  <Line {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </Line>
);
export const Search = (p: IconProps) => (
  <Line {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Line>
);
export const Camera = (p: IconProps) => (
  <Line {...p}>
    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
    <circle cx="12" cy="13" r="3.5" />
  </Line>
);
export const Copy = (p: IconProps) => (
  <Line {...p}>
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
  </Line>
);
export const Check = (p: IconProps) => (
  <Line {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Line>
);
export const Lock = (p: IconProps) => (
  <Line {...p}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Line>
);
export const ExternalLink = (p: IconProps) => (
  <Line {...p}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Line>
);

/** Plus that turns into a minus when `open` (FAQ). */
export function PlusMinus({ open, ...p }: IconProps & { open: boolean }) {
  return (
    <Line size={18} {...p}>
      {!open && <path d="M12 5v14" />}
      <path d="M5 12h14" />
    </Line>
  );
}

/** Filled red map pin. */
export function MapPin({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7z" fill="var(--red)" />
      <circle cx="12" cy="9" r="2.6" fill="#fff" />
    </svg>
  );
}

/** Green circle with a tick. */
export function TickCircle({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="11" fill="var(--green)" />
      <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const amenityPaths: Record<AmenityIcon, ReactNode> = {
  gate: (
    <>
      <path d="M4 21V9l8-5 8 5v12" />
      <path d="M9 21v-7h6v7" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  road: <path d="M8 3L5 21M16 3l3 18M12 5v2M12 11v2M12 17v2" />,
  lamp: (
    <>
      <path d="M12 21V10" />
      <path d="M8 10h8l-1-4H9z" />
      <path d="M12 3v1" />
    </>
  ),
  drain: (
    <>
      <path d="M3 15c2 0 2 1.5 4.5 1.5S10 15 12 15s2 1.5 4.5 1.5S19 15 21 15" />
      <path d="M12 3v8M9 8l3 3 3-3" />
    </>
  ),
  leaf: (
    <>
      <path d="M12 20v-8" />
      <path d="M12 12c0-3 2-5 5-5 0 3-2 5-5 5z" />
      <path d="M12 14c0-3-2-5-5-5 0 3 2 5 5 5z" />
      <path d="M5 20h14" />
    </>
  ),
};

export function AmenityGlyph({ icon }: { icon: AmenityIcon }) {
  return (
    <Line size={20} strokeWidth={1.9}>
      {amenityPaths[icon]}
    </Line>
  );
}
