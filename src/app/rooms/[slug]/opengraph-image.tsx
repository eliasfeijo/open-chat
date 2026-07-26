import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "RoomSurf room";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const roomSurfIconDataUrl = `data:image/svg+xml;base64,${readFileSync(
  join(process.cwd(), "public", "roomsurf-logo.svg"),
).toString("base64")}`;

const roomSurfIconMonochromeDataUrl = `data:image/svg+xml;base64,${readFileSync(
  join(process.cwd(), "public", "roomsurf-logo-monochrome.svg"),
).toString("base64")}`;

type RoomOpenGraphImageProps = Readonly<{
  params: Promise<{
    slug: string;
  }>;
}>;

function toTitleCaseSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join(" ");
}

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

  const roomName = toTitleCaseSlug(slug) || slug;
  const roomTopic = "Public room conversation";
  const roomDescription =
    "Read the room before joining. Sign in to join and post in realtime.";

  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background:
          "radial-gradient(circle at 12% 18%, rgba(250, 204, 21, 0.32), transparent 36%), radial-gradient(circle at 88% 72%, rgba(14, 116, 144, 0.34), transparent 44%), linear-gradient(140deg, #0f172a 0%, #111827 45%, #1f2937 100%)",
        color: "#f8fafc",
        display: "flex",
        gap: "42px",
        height: "100%",
        justifyContent: "space-between",
        padding: "64px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          justifyContent: "flex-start",
          width: "640px",
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: "14px" }}>
          <img
            alt="RoomSurf icon"
            height={54}
            src={roomSurfIconMonochromeDataUrl}
            style={{ borderRadius: "12px" }}
            width={54}
          />
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
              fontSize: 20,
              letterSpacing: "0.12em",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            /{slug}
          </p>
          <h1
            style={{
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: "-0.035em",
              lineHeight: 1.02,
              margin: 0,
              maxWidth: "580px",
            }}
          >
            {truncate(roomName, 80)}
          </h1>
          <p
            style={{
              color: "#cbd5e1",
              fontSize: 24,
              fontWeight: 500,
              lineHeight: 1.24,
              margin: 0,
              maxWidth: "520px",
            }}
          >
            {truncate(roomTopic, 90)}
          </p>
          <div
            style={{
              alignItems: "center",
              alignSelf: "flex-start",
              background: "#facc15",
              borderRadius: "999px",
              color: "#0f172a",
              display: "flex",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.01em",
              padding: "10px 18px",
            }}
          >
            Browse rooms
          </div>
          <p
            style={{
              color: "#e2e8f0",
              fontSize: 20,
              lineHeight: 1.3,
              margin: 0,
              maxWidth: "540px",
            }}
          >
            {truncate(roomDescription, 150)}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "nowrap" }}>
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
                    fontSize: 16,
                    fontWeight: 500,
                    letterSpacing: "0.01em",
                    padding: "6px 12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          alignItems: "center",
          display: "flex",
          flex: 1,
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "40px",
            boxShadow: "0 28px 80px rgba(0,0,0,0.26)",
            display: "flex",
            height: "410px",
            justifyContent: "center",
            padding: "26px",
            position: "relative",
            width: "410px",
          }}
        >
          <img
            alt="RoomSurf icon"
            height={358}
            src={roomSurfIconDataUrl}
            style={{ borderRadius: "26px" }}
            width={358}
          />
        </div>
      </div>
    </div>,
    size,
  );
}
