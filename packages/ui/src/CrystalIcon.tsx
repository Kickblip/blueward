export default function CrystalIcon({ className, size }: { className?: string; size?: number }) {
  return (
    <svg
      className={className ?? "text-blue-300"}
      width={size ?? 14}
      height={size ?? 14}
      viewBox="0 0 226 258"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M74.0523 110.69L108.619 130.702V170.725L38.3674 211.394L3.80107 191.382V151.359L74.0523 110.69Z"
        fill="currentColor"
      />
      <path
        d="M113.179 0L147.687 19.9905L147.717 102.351L113.209 122.342L78.7007 102.351L78.6708 19.9905L113.179 0Z"
        fill="currentColor"
      />
      <path d="M34.5808 42.4452L69.1617 62.4194V102.368L34.5808 122.342L0 102.368V62.4194L34.5808 42.4452Z" fill="currentColor" />
      <path
        d="M191.599 42.4452L226 62.4194V102.368L191.599 122.342L157.199 102.368V62.4194L191.599 42.4452Z"
        fill="currentColor"
      />
      <path
        d="M113.194 178.103L147.775 198.077V238.026L113.194 258L78.6132 238.026V198.077L113.194 178.103Z"
        fill="currentColor"
      />
      <path
        d="M152.803 110.69L225.499 152.67V192.651L190.881 212.642L118.185 170.662V130.681L152.803 110.69Z"
        fill="currentColor"
      />
    </svg>
  )
}
