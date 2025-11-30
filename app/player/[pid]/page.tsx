import Card from "@/components/ui/Card"
import ProfileMatch from "@/components/ProfileMatch"

export default async function PlayerProfile({ params }: { params: Promise<{ pid: string }> }) {
  const { pid } = await params

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-1 flex flex-col gap-4">
        <Card>
          <div className="flex gap-1 items-end">
            <p className="font-oswald scale-y-150 font-semibold text-5xl">Mrbob21</p>
            <p className="text-lg font-semibold opacity-60">#1234</p>
          </div>
        </Card>
      </div>

      <div className="col-span-2 flex flex-col gap-4">
        <ProfileMatch win={true} />
        <ProfileMatch win={true} />
        <ProfileMatch win={false} />
        <ProfileMatch win={false} />
        <ProfileMatch win={true} />
      </div>
    </div>
  )
}
