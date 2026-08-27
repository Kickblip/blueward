"use client"

type TwitchStreamProps = {
  channel: string
}

export function StreamEmbed({ channel }: TwitchStreamProps) {
  const parent = process.env.NEXT_PUBLIC_TWITCH_PARENT ?? "localhost"

  const src =
    `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}` +
    `&parent=${encodeURIComponent(parent)}` +
    `&autoplay=true&muted=true`

  return (
    <div className="mx-auto aspect-video w-full max-w-5xl">
      <iframe
        src={src}
        title={`${channel} Twitch livestream`}
        allowFullScreen
        allow="autoplay; fullscreen"
        className="size-full border-0"
      />
    </div>
  )
}
