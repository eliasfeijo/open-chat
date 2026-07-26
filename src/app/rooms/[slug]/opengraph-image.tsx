import { ImageResponse } from "next/og";

import { getRoomBySlug } from "@/modules/rooms";

export const runtime = "nodejs";

export const alt = "RoomSurf room";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

type RoomOpenGraphImageProps = Readonly<{
  params: Promise<{
    slug: string;
  }>;
}>;

function truncate(input: string, maxLength: number): string {
  if (input.length <= maxLength) {
    return input;
  }

  return `${input.slice(0, maxLength - 1)}...`;
}

export default async function RoomOpenGraphImage({
  params,
}: RoomOpenGraphImageProps) {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);

  const roomName = room?.name ?? `/${slug}`;
  const roomTopic = room?.topic ?? "Public room conversation";
  const roomDescription =
    room?.description ??
    "Read the room before joining. Sign in and join the room to post.";

  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background:
          "radial-gradient(circle at 12% 18%, rgba(250, 204, 21, 0.32), transparent 36%), radial-gradient(circle at 88% 72%, rgba(14, 116, 144, 0.34), transparent 44%), linear-gradient(140deg, #0f172a 0%, #111827 45%, #1f2937 100%)",
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "64px",
        width: "100%",
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: "14px",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "rgba(248, 250, 252, 0.16)",
            border: "1px solid rgba(248, 250, 252, 0.28)",
            borderRadius: "999px",
            display: "flex",
            fontSize: 26,
            fontWeight: 700,
            height: 54,
            justifyContent: "center",
            letterSpacing: "0.02em",
            width: 54,
          }}
        >
          RS
        </div>
        <span
          style={{
            fontSize: 42,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          RoomSurf Room
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <p
          style={{
            color: "#dbeafe",
            fontSize: 22,
            letterSpacing: "0.12em",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          /{slug}
        </p>
        <h1
          style={{
            fontSize: 70,
            fontWeight: 700,
            letterSpacing: "-0.035em",
            lineHeight: 1.06,
            margin: 0,
            maxWidth: "1030px",
          }}
        >
          {truncate(roomName, 80)}
        </h1>
        <p
          style={{
            color: "#cbd5e1",
            fontSize: 34,
            fontWeight: 500,
            lineHeight: 1.24,
            margin: 0,
            maxWidth: "1000px",
          }}
        >
          {truncate(roomTopic, 90)}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <p
          style={{
            color: "#e2e8f0",
            fontSize: 24,
            lineHeight: 1.3,
            margin: 0,
            maxWidth: "1040px",
          }}
        >
          {truncate(roomDescription, 150)}
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          {["Public room", "Read before joining", "Member-only posting"].map(
            (label) => (
              <div
                key={label}
                style={{
                  alignItems: "center",
                  background: "rgba(15, 23, 42, 0.42)",
                  border: "1px solid rgba(148, 163, 184, 0.44)",
                  borderRadius: "999px",
                  color: "#e2e8f0",
                  display: "flex",
                  fontSize: 20,
                  fontWeight: 500,
                  letterSpacing: "0.01em",
                  padding: "8px 18px",
                }}
              >
                {label}
              </div>
            ),
          )}
        </div>
      </div>
    </div>,
    size,
  );
}
