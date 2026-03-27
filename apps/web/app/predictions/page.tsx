import PredictionsClient from "./PredictionsClient"
import AdminClient from "./AdminClient"
import { currentUser } from "@clerk/nextjs/server"

export default async function Predictions() {
  const user = await currentUser()
  let isAdmin = user && user.privateMetadata.role === "admin"

  return (
    <div className="flex flex-col gap-4">
      {isAdmin && <AdminClient />}
      <PredictionsClient />
    </div>
  )
}
