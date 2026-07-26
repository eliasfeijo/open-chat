import { ImageResponse } from "next/og";

export const alt =
  "RoomSurf - Public-first chat for discoverable conversations";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          RoomSurf
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <p
          style={{
            color: "#dbeafe",
            fontSize: 24,
            letterSpacing: "0.12em",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          Public-first chat
        </p>
        <h1
          style={{
            fontSize: 74,
            fontWeight: 700,
            letterSpacing: "-0.035em",
            lineHeight: 1.06,
            margin: 0,
            maxWidth: "980px",
          }}
        >
          Surf public rooms. Discover conversations.
        </h1>
      </div>

      <div style={{ display: "flex", gap: "14px" }}>
        {[
          "Public rooms",
          "Realtime discussion",
          "Discoverable communities",
          "Search and tags",
        ].map((label) => (
          <div
            key={label}
            style={{
              alignItems: "center",
              background: "rgba(15, 23, 42, 0.42)",
              border: "1px solid rgba(148, 163, 184, 0.44)",
              borderRadius: "999px",
              color: "#e2e8f0",
              display: "flex",
              fontSize: 24,
              fontWeight: 500,
              letterSpacing: "0.01em",
              padding: "10px 20px",
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
