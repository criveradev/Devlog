/** Iconografía lineal compartida para mantener una interfaz coherente y accesible. */
const paths = {
  home: <path d="M3 11.5 12 4l9 7.5M5.5 10v10h13V10M9 20v-6h6v6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  user: <path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
  message: <path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.7 9.7 0 0 1-4-.9L3 21l1.7-4.6A8.2 8.2 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" />,
  arrowUp: <path d="m7 11 5-5 5 5M12 6v12" />,
  arrowLeft: <path d="m15 18-6-6 6-6" />,
  image: <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="m3 16 5-5 4 4 2-2 7 7M15.5 8h.01" /></>,
  logout: <path d="M10 17l5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />,
  sparkles: <path d="m12 3-1 3.2a5 5 0 0 1-3.2 3.2l-3.2 1 3.2 1a5 5 0 0 1 3.2 3.2l1 3.2 1-3.2a5 5 0 0 1 3.2-3.2l3.2-1-3.2-1A5 5 0 0 1 13 6.2L12 3ZM5 3v4M3 5h4M19 17v4M17 19h4" />,
  external: <path d="M14 3h7v7M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10ZM9 12l2 2 4-4" />,
  check: <path d="m5 12 4 4L19 6" />,
  refresh: <path d="M20 6v5h-5M4 18v-5h5M6.1 9A7 7 0 0 1 18.7 6L20 11M4 13l1.3 5A7 7 0 0 0 17.9 15" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  alert: <><path d="M10.3 3.6 2.4 17.2A2 2 0 0 0 4.1 20h15.8a2 2 0 0 0 1.7-2.8L13.7 3.6a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
  trash: <path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5" />,
};

function Icon({ name, size = 20, filled = false, className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

export default Icon;
