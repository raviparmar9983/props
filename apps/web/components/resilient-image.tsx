"use client";

import { ImageOff } from "lucide-react";
import { useState, type ImgHTMLAttributes } from "react";

interface ResilientImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string | null | undefined;
  wrapperClassName?: string;
}

/** Image with a layout-stable shimmer and graceful fallback for unavailable media. */
export function ResilientImage({ src, alt, className = "", wrapperClassName = "", onLoad, onError, ...props }: ResilientImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(src ? "loading" : "error");
  const unavailable = status === "error" || !src;

  return (
    <span className={`relative block h-full w-full overflow-hidden bg-slate-100 ${wrapperClassName}`}>
      {status === "loading" && <span className="skeleton absolute inset-0 rounded-none" aria-hidden />}
      {!unavailable && (
        <img
          {...props}
          src={src}
          alt={alt}
          className={`h-full w-full object-cover transition duration-500 ${status === "loaded" ? "scale-100 opacity-100" : "scale-[1.025] opacity-0"} ${className}`}
          onLoad={(event) => { setStatus("loaded"); onLoad?.(event); }}
          onError={(event) => { setStatus("error"); onError?.(event); }}
        />
      )}
      {unavailable && (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-ink-blue to-blueprint px-4 text-center text-white/80">
          <ImageOff size={25} strokeWidth={1.6} aria-hidden />
          <span className="text-xs font-medium">Photo unavailable</span>
        </span>
      )}
    </span>
  );
}
