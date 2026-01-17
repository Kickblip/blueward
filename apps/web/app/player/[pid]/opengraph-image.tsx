import { ImageResponse } from "next/og"
import { fetchPlayerProfileByPuuid, fetchProfilePictureByAuthId } from "./actions"

export const alt = "Player Profile"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const oswaldMedium = fetch(`${process.env.NEXT_PUBLIC_BASE}/fonts/Oswald-Medium.ttf`).then((res) => res.arrayBuffer())
const oswaldSemiBold = fetch(`${process.env.NEXT_PUBLIC_BASE}/fonts/Oswald-SemiBold.ttf`).then((res) => res.arrayBuffer())

function safeText(x: unknown, fallback: string) {
  return typeof x === "string" && x.trim().length > 0 ? x.trim() : fallback
}

function clamp(s: string, max: number) {
  const t = s.trim()
  return t.length > max ? t.slice(0, max - 1) + "…" : t
}

export default async function Image({ params }: { params: Promise<{ pid: string }> }) {
  const { pid } = await params
  const playerProfile = await fetchPlayerProfileByPuuid(pid)
  const [medium, semiBold] = await Promise.all([oswaldMedium, oswaldSemiBold])

  const riotIdGameName = safeText(playerProfile?.riotIdGameName, "Unknown Player")
  const riotIdTagline = safeText(playerProfile?.riotIdTagline, "????")
  const displayName = clamp(riotIdGameName, 16)

  const profilePictureUrl = await fetchProfilePictureByAuthId(playerProfile?.authId)

  const bannerId = playerProfile?.bannerId ?? 0
  const bannerUrl = `${process.env.NEXT_PUBLIC_BASE}/banners/${bannerId}.jpg`

  const barH = 140
  const avatarSize = 250
  const avatarLift = 130
  const pad = 40

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        overflow: "hidden",
        background: "#0b0f19",
        fontFamily: "Oswald",
      }}
    >
      <img
        src={bannerUrl}
        alt=""
        width={1200}
        height={630}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: barH,
          display: "flex",
          alignItems: "center",
          paddingLeft: pad + avatarSize + 28,
          paddingRight: pad,
          background: "#09090b",
          borderTop: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row", alignItems: "baseline", gap: 14 }}>
          <div
            style={{
              fontSize: 82,
              fontWeight: 600,
              color: "white",
              display: "flex",
              letterSpacing: -1,
              lineHeight: 1,
            }}
          >
            {displayName}
          </div>

          <div
            style={{
              fontSize: 50,
              fontWeight: 500,
              lineHeight: 1,
              display: "flex",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            #{riotIdTagline}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: pad,
          bottom: barH - avatarLift,
          width: avatarSize,
          height: avatarSize,
          borderRadius: 9999,
          overflow: "hidden",
          background: "#09090b",
          border: "4px solid #09090b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={profilePictureUrl ?? `${process.env.NEXT_PUBLIC_BASE}/defaultpfp.jpg`}
          alt=""
          width={avatarSize}
          height={avatarSize}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Oswald", data: medium, weight: 500, style: "normal" },
        { name: "Oswald", data: semiBold, weight: 600, style: "normal" },
      ],
    },
  )
}
