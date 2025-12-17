import Image from "next/image";

export function HeroBanner({ src, width, height, className }) {
  return (
    <Image
      src={src}
      alt=""
      className={`w-full h-50 object-cover mt-4 mb-6 rounded ${className}`}
      width={width}
      height={height}
      priority
    />
  );
}
