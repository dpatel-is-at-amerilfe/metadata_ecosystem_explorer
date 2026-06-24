interface IconProps {
  size?: number;
  className?: string;
}

const wrap = (paths: React.ReactNode, size = 16, className = '') => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {paths}
  </svg>
);

export const SearchIcon = ({ size, className }: IconProps) =>
  wrap(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>,
    size,
    className,
  );

export const ZoomInIcon = ({ size, className }: IconProps) =>
  wrap(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M11 8v6M8 11h6M21 21l-4.3-4.3" />
    </>,
    size,
    className,
  );

export const ZoomOutIcon = ({ size, className }: IconProps) =>
  wrap(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M8 11h6M21 21l-4.3-4.3" />
    </>,
    size,
    className,
  );

export const FitIcon = ({ size, className }: IconProps) =>
  wrap(
    <>
      <path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4" />
    </>,
    size,
    className,
  );

export const ResetIcon = ({ size, className }: IconProps) =>
  wrap(
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </>,
    size,
    className,
  );

export const TargetIcon = ({ size, className }: IconProps) =>
  wrap(
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.5" />
    </>,
    size,
    className,
  );

export const LayersIcon = ({ size, className }: IconProps) =>
  wrap(
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </>,
    size,
    className,
  );

export const EyeIcon = ({ size, className }: IconProps) =>
  wrap(
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>,
    size,
    className,
  );

export const EyeOffIcon = ({ size, className }: IconProps) =>
  wrap(
    <>
      <path d="M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 7 10 7a16 16 0 0 1-3 3.6M6.6 6.6A16 16 0 0 0 2 11s3.5 7 10 7a10 10 0 0 0 4-.8" />
      <path d="m2 2 20 20M9.5 9.5a3 3 0 0 0 4.2 4.2" />
    </>,
    size,
    className,
  );

export const ChevronIcon = ({ size, className }: IconProps) =>
  wrap(<path d="m6 9 6 6 6-6" />, size, className);

export const ReportIcon = ({ size, className }: IconProps) =>
  wrap(
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>,
    size,
    className,
  );
