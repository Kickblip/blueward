"use client"

import { RiPencilFill } from "react-icons/ri"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"
import { UploadTrigger } from "./ui/upload-trigger"
import { Spinner } from "./ui/spinner"
import {
  IMAGE_MIME_TYPES,
  MAX_CLUB_BANNER_SIZE_BYTES,
  MAX_CLUB_LOGO_SIZE_BYTES,
} from "@/lib/config"

export function ClubSettingsImageUpload({
  clubId,
  clubName,
  logoKey,
  bannerKey,
}: {
  clubId: number
  clubName: string
  logoKey: string | null
  bannerKey: string | null
}) {
  const router = useRouter()
  const [uploading, setUploading] = useState<"logo" | "banner" | null>(null)

  async function uploadImage(kind: "logo" | "banner", [file]: File[]) {
    if (!file || uploading) return

    if (!IMAGE_MIME_TYPES.some((type) => type === file.type)) {
      toast.error("Choose a JPEG, PNG, or WebP image")
      return
    }

    setUploading(kind)

    try {
      const endpoint = `/api/clubs/${clubId}/${kind}`

      // Request a signed URL
      const response = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          contentType: file.type,
          size: file.size,
        }),
      })

      const upload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(upload?.error ?? "Could not start upload")
      }

      // Upload to the url
      const uploaded = await fetch(upload.url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      })

      if (!uploaded.ok) {
        throw new Error("Could not upload logo to storage")
      }

      // Attach the uploaded object to the club
      const saved = await fetch(endpoint, {
        method: "PATCH",
        body: JSON.stringify({ key: upload.key }),
      })

      if (!saved.ok) {
        const result = await saved.json().catch(() => null)
        throw new Error(result?.error ?? "Could not save club logo")
      }

      router.refresh()
      toast.success(`Club ${kind} updated`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update club logo"
      )
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="relative aspect-[2/1] w-full">
      <div className="relative h-full w-full overflow-hidden rounded-md">
        {bannerKey ? (
          <Image
            src={`${process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL}/${bannerKey}`}
            alt="Club banner"
            fill
            sizes="(max-width: 640px) 100vw, 576px"
            className="object-cover"
          />
        ) : (
          <Image
            src="/club-default-banner.webp"
            alt="Club banner"
            fill
            sizes="(max-width: 640px) 100vw, 576px"
            className="object-cover"
          />
        )}
      </div>

      <div className="absolute -bottom-8 left-4 h-32 w-32 overflow-hidden rounded-xl border-4 border-background">
        {logoKey ? (
          <Image
            src={`${process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL}/${logoKey}`}
            alt="Club logo"
            fill
            sizes="128px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-blue-950 text-5xl font-semibold text-white">
            {clubName.trim().charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <UploadTrigger
        accept={IMAGE_MIME_TYPES}
        maxSize={MAX_CLUB_BANNER_SIZE_BYTES}
        onFilesSelected={(files) => uploadImage("banner", files)}
        onFilesRejected={() => toast.error("Banner must be 5 MiB or smaller")}
        disabled={uploading !== null}
        aria-label="Change club banner"
        aria-busy={uploading === "banner"}
        size="icon-lg"
        variant="secondary"
        className="absolute top-2 right-2"
      >
        {uploading === "banner" ? <Spinner /> : <RiPencilFill />}
      </UploadTrigger>

      <UploadTrigger
        accept={IMAGE_MIME_TYPES}
        maxSize={MAX_CLUB_LOGO_SIZE_BYTES}
        onFilesSelected={(files) => uploadImage("logo", files)}
        onFilesRejected={() => toast.error("Logo must be 2 MiB or smaller")}
        disabled={uploading !== null}
        aria-label="Change club logo"
        aria-busy={uploading === "logo"}
        size="icon-sm"
        variant="secondary"
        className="absolute bottom-14 left-26"
      >
        {uploading === "logo" ? <Spinner /> : <RiPencilFill />}
      </UploadTrigger>
    </div>
  )
}
