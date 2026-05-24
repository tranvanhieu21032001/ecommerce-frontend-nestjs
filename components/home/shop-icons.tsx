export function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="m16.5 16.5 4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MenuIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CartIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M6 7h15l-2 9H8L6 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M6 7 5 4H2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="9" cy="20" r="1.5" fill="currentColor" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function HeartIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M20.5 7.8c0 5.1-8.5 10.7-8.5 10.7S3.5 12.9 3.5 7.8A4.3 4.3 0 0 1 12 6.4a4.3 4.3 0 0 1 8.5 1.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UserIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 20a7 7 0 0 1 14 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StarIcon({ filled = true }: { filled?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "#93D991" : "#ababab"}
    >
      <path d="m12 2 2.9 6 6.6.9-4.8 4.7 1.2 6.6L12 17.1l-5.9 3.1 1.2-6.6-4.8-4.7 6.6-.9L12 2Z" />
    </svg>
  );
}

export function TruckIcon() {
  return (
    <svg
      aria-hidden="true"
      width="45"
      height="45"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M3 7h11v9H3V7Zm11 3h4l3 3v3h-7v-6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function ShieldIcon() {
  return (
    <svg
      aria-hidden="true"
      width="45"
      height="45"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 3 5 6v5c0 4.5 2.8 8.5 7 10 4.2-1.5 7-5.5 7-10V6l-7-3Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m8.5 12 2.2 2.2 4.8-5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeadsetIcon() {
  return (
    <svg
      aria-hidden="true"
      width="45"
      height="45"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M4 13v-1a8 8 0 0 1 16 0v1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M4 13h3v5H4v-5Zm13 0h3v5h-3v-5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M20 18c0 2-2 3-5 3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ReturnIcon() {
  return (
    <svg
      aria-hidden="true"
      width="45"
      height="45"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M7 7h10a4 4 0 0 1 0 8H6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="m9 4-4 3 4 3M15 20l4-3-4-3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
