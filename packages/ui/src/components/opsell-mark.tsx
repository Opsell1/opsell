/** The Opsell app icon. */
export function OpsellMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <rect width="64" height="64" rx="14" fill="#0b0c0e" />
      <path
        d="M39.46 42.65A13.00 13.00 0 1 1 44.95 33.13"
        fill="none"
        stroke="#ffffff"
        strokeWidth="6"
      />
      <circle cx="43.26" cy="38.5" r="3.3" fill="#2e5bff" />
    </svg>
  );
}
