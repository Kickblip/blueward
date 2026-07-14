import { cn } from "@/lib/utils"

export function Logo({
  size = 32,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("[--logo-end:#003BBA] [--logo-start:#00B2FF]", className)}
    >
      <path
        d="M186.693 276.879C186.693 276.879 90.3152 285.738 73.5966 198.132C34.2565 144.979 44.093 72.1381 44.093 72.1381C44.093 72.1381 110.966 84.9344 119.817 121.355C119.817 121.355 122.767 118.402 129.651 114.464C136.535 110.527 139.488 110.527 139.488 110.527C176.859 36.7023 209.313 18 209.313 18C209.313 18 244.717 65.2478 231.932 144.979C270.287 226.678 186.693 276.879 186.693 276.879Z"
        fill="url(#logo-gradient)"
      />
      <path
        d="M185.9 203.937C194.761 183.29 220.358 177.391 220.358 177.391C220.358 177.391 227.25 200.987 218.389 221.634C209.528 242.281 182.947 248.18 182.947 248.18C182.947 248.18 177.04 224.583 185.9 203.937Z"
        fill="white"
      />
      <path
        d="M103.203 241.298C84.4971 224.583 85.4816 208.853 85.4816 208.853C85.4816 208.853 97.2957 211.802 113.048 226.55C128.8 241.298 133.723 258.995 133.723 258.995C133.723 258.995 121.909 258.012 103.203 241.298Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="logo-gradient"
          x1="142.5"
          y1="18"
          x2="142.5"
          y2="277.129"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--logo-start)" />
          <stop offset="1" stopColor="var(--logo-end)" />
        </linearGradient>
      </defs>
    </svg>
  )
}
