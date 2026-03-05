import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Dasha | Impossibl";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const fontData = await readFile(
    join(process.cwd(), "app/fonts/adelle-sans/adelle-sans-heavy.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          gap: "24px",
        }}
      >
        {/* main title */}
        <div
          style={{
            fontSize: 96,
            fontFamily: "Adelle",
            fontWeight: 900,
            color: "#fff",
            textTransform: "uppercase",
            letterSpacing: "-0.04em",
          }}
        >
          Dasha .
        </div>

        {/* subtitle */}
        <div
          style={{
            fontSize: 24,
            fontFamily: "Adelle",
            fontWeight: 900,
            color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            display: "flex",
            gap: "24px",
          }}
        >
          <span>Talks with Dasha</span>
          <span>·</span>
          <span>Impossibl</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Adelle",
          data: fontData,
          weight: 900,
          style: "normal",
        },
      ],
    }
  );
}
