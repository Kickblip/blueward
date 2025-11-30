import ParticipantPerformanceWidget from "@/components/ParticipantPerformanceWidget"

export default async function Match({ params }: { params: Promise<{ mid: string }> }) {
  const { mid } = await params

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-1 flex flex-col gap-4">
        <ParticipantPerformanceWidget />
        <ParticipantPerformanceWidget />
        <ParticipantPerformanceWidget />
        <ParticipantPerformanceWidget />
        <ParticipantPerformanceWidget />
      </div>

      <div className="col-span-1 flex flex-col gap-4">
        <ParticipantPerformanceWidget />
        <ParticipantPerformanceWidget />
        <ParticipantPerformanceWidget />
        <ParticipantPerformanceWidget />
        <ParticipantPerformanceWidget />
      </div>
    </div>
  )
}
