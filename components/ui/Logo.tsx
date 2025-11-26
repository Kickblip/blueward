import Image from "next/image"

export default function Logo() {
  return <Image src="/logo.svg" alt="" width={155} height={32} priority />
}
