import Link from "next/link";

/**
 *
 *  Button / Link component for internal or external navigation.
 *
 *  @param {Object} props
 *  @param {string} props.href - The URL to navigate to when the button is clicked
 *  @param {React.ReactNode} [props.children] - Button content
 *  @param {string} [props.className] - Additional tailwind classes
 *  @param {boolean} [props.external=false] - If true, the link will open in a new tab
 */

export function Button({ href, children, className, external = false }) {
  return (
    <Link
      href={href}
      className={`w-full flex items-center justify-between text-sm font-medium
                  py-3 px-4 rounded border cursor-pointer
                  border-blue-200 bg-blue-100 hover:bg-blue-200/80 text-blue-900
                  dark:border-blue-400/30 dark:bg-blue-900/30 dark:hover:bg-blue-800/30 dark:text-white
                  transition-colors duration-200 ${className}`}
      target={external ? "_blank" : undefined}
    >
      {children}
      {external ? <ArrowUpRight /> : null}
    </Link>
  );
}

export function ArrowUpRight() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="ml-1"
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}
