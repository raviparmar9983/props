import { useEffect, useState } from "react";
import { subscribe, dismiss, type ToastItem } from "../lib/toast";

const PALETTE: Record<ToastItem["type"], { bg: string; glyph: string }> = {
  success: { bg: "#1DA55E", glyph: "M5 13l4 4L19 7" },
  error: { bg: "#E23744", glyph: "M18 6L6 18M6 6l12 12" },
  info: { bg: "#1B2A4A", glyph: "M12 8v.01M12 12v4" },
};

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => subscribe(setItems), []);

  return (
    <div
      style={{
        position: "fixed",
        top: 12,
        left: 0,
        right: 0,
        zIndex: 1300,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: "0 16px",
        pointerEvents: "none",
      }}
    >
      {items.map((item) => {
        const palette = PALETTE[item.type];
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => dismiss(item.id)}
            style={{
              pointerEvents: "auto",
              width: "100%",
              maxWidth: 420,
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid #E7E9ED",
              background: "#FFFFFF",
              boxShadow: "0 8px 24px rgba(27,42,74,0.14)",
              textAlign: "left",
              cursor: "pointer",
              fontFamily: "inherit",
              animation: "toast-pop 0.22s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                flexShrink: 0,
                borderRadius: 999,
                background: palette.bg,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={palette.glyph} />
              </svg>
            </span>
            <span style={{ minWidth: 0 }}>
              {item.title && (
                <span
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#1F2430",
                  }}
                >
                  {item.title}
                </span>
              )}
              <span style={{ display: "block", fontSize: 13, color: "#5B6270" }}>
                {item.message}
              </span>
            </span>
          </button>
        );
      })}
      <style>{`@keyframes toast-pop{from{opacity:0;transform:translateY(-8px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
    </div>
  );
}
