/**
 * Inline SVG icon set shared across the property components.
 *
 * Every icon inherits its color from `currentColor` and accepts a `className`
 * (defaulting to `h-4 w-4`) plus any other SVG props, so callers size and
 * color them with Tailwind utilities. Icons are decorative (`aria-hidden`);
 * pair them with visible or screen-reader text. Keeping the set inline avoids
 * pulling in an icon dependency.
 */

function Svg({ className = 'h-4 w-4', children, ...props }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
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

export function BedIcon(props) {
  return (
    <Svg {...props}>
      <path d="M2 9V5a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v4" />
      <path d="M2 11h20v6" />
      <path d="M4 17v3" />
      <path d="M20 17v3" />
      <path d="M6 11V9a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2" />
      <path d="M13 11V9a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2" />
    </Svg>
  );
}

export function BathIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 12V5a2 2 0 0 1 2-2 2 2 0 0 1 2 2" />
      <path d="M2 12h20v3a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" />
      <path d="M7 19l-1 2" />
      <path d="M17 19l1 2" />
      <path d="M8 5h.01" />
    </Svg>
  );
}

export function RulerIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v4" />
      <path d="M15 17v4" />
      <path d="M3 9h4" />
      <path d="M17 15h4" />
    </Svg>
  );
}

export function HomeIcon(props) {
  return (
    <Svg {...props}>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
      <path d="M9 21v-6h6v6" />
    </Svg>
  );
}

export function CalendarIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
    </Svg>
  );
}

export function TagIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 2 2 12l8 8L20 10V2z" />
      <circle cx="15.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Heart outline by default; pass `filled` to render a solid heart. */
export function HeartIcon({ filled = false, ...props }) {
  return (
    <Svg fill={filled ? 'currentColor' : 'none'} {...props}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </Svg>
  );
}

export function ShareIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </Svg>
  );
}

export function ChevronLeftIcon(props) {
  return (
    <Svg {...props}>
      <path d="M15 18l-6-6 6-6" />
    </Svg>
  );
}

export function ChevronRightIcon(props) {
  return (
    <Svg {...props}>
      <path d="M9 18l6-6-6-6" />
    </Svg>
  );
}

export function ChevronDownIcon(props) {
  return (
    <Svg {...props}>
      <path d="M6 9l6 6 6-6" />
    </Svg>
  );
}

export function CloseIcon(props) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

export function MapPinIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </Svg>
  );
}

export function PhoneIcon(props) {
  return (
    <Svg {...props}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" />
    </Svg>
  );
}

export function MailIcon(props) {
  return (
    <Svg {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 6 10-6" />
    </Svg>
  );
}

/** Indeterminate spinner, decorative and hidden from assistive tech (`aria-hidden`); pair with visible "Loading…" text. Animate with Tailwind's `animate-spin`. */
export function SpinnerIcon({ className = 'h-6 w-6 animate-spin' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z"
      />
    </svg>
  );
}

/**
 * Decorative "no photo available" illustration shown when a listing has no media.
 * Fills its container; give it a sized, background-colored wrapper.
 */
export function PhotoPlaceholder({ className = '' }) {
  return (
    <div className={`flex items-center justify-center bg-gray-100 text-gray-300 ${className}`}>
      <svg
        className="h-1/3 w-1/3 max-h-24 max-w-24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
        focusable="false"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10" r="1.5" />
        <path d="m21 17-5-5L5 21" />
      </svg>
    </div>
  );
}
