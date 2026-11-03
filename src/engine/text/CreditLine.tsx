import React from "react";
import { safeRect, type SafeArea } from "./safeArea";

/**
 * Image credits and data sources, one burned-in line while they are up. Widescreen: small, in the
 * bottom margin under the captions (the captions own the safe area's bottom band). Vertical: at
 * the bottom of the safe area, above the platform UI.
 */
export const CreditLine: React.FC<{ text: string; width: number; height: number; safeArea: SafeArea; fontFamily: string }> = ({ text, width, height, safeArea, fontFamily }) => {
  const safe = safeRect(safeArea, width, height);
  const wide = width > height;
  const size = Math.round(Math.min(width, height) * (wide ? 0.0155 : 0.022));
  return (
    <div
      style={{
        position: "absolute",
        ...(wide ? { left: safe.x, right: width - (safe.x + safe.w), textAlign: "center" } : { left: safe.x, maxWidth: safe.w }),
        bottom: wide ? Math.round(height * 0.022) : height - (safe.y + safe.h) + size * 0.2,
        fontFamily,
        fontSize: size,
        fontWeight: wide ? 500 : 600,
        lineHeight: 1.25,
        color: wide ? "rgba(255,255,255,0.85)" : "#ffffff",
        ...(wide
          ? { textShadow: "0 1px 3px rgba(0,0,0,0.8)" }
          : { background: "rgba(0,0,0,0.55)", padding: `${size * 0.25}px ${size * 0.5}px`, borderRadius: size * 0.3 }),
      }}
    >
      {text}
    </div>
  );
};
