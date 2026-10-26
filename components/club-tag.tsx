import Image from "next/image"

export function ClubTag({ tag, iconId }: { tag: string; iconId: number }) {
  return (
    <div className="flex w-fit items-center gap-1.5 rounded-sm border bg-secondary px-1.5 py-1">
      <Image src={`/clubs/icons/${iconId}.png`} alt="" width={16} height={16} />
      <span className="font-oswald text-xs font-semibold uppercase">{tag}</span>
    </div>
  )
}
