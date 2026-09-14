"use client";

import { ImageOff } from "lucide-react";
import { useCallback, useState, type ImgHTMLAttributes } from "react";

interface ResilientImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string | null | undefined;
  wrapperClassName?: string;
}

/** Image with a layout-stable shimmer and graceful fallback for unavailable media. */
export function ResilientImage({ src, alt, className = "", wrapperClassName = "", onLoad, onError, loading = "lazy", decoding = "async", ...props }: ResilientImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(src ? "loading" : "error");
  const unavailable = status === "error" || !src;

  // A browser resolves an already-cached (or synchronously decoded) image
  // before React ever attaches the `onLoad` listener, so that event can fire
  // before we're listening — leaving the image stuck at opacity-0 forever.
  // A callback ref runs right when the node is committed, so checking
  // `complete` there catches that case too, not just a real load event.
  const checkAlreadyLoaded = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) setStatus("loaded");
  }, []);

  return (
    <span className={`relative block h-full w-full overflow-hidden bg-slate-100 ${wrapperClassName}`}>
      {status === "loading" && <span className="skeleton absolute inset-0 rounded-none" aria-hidden />}
      {!unavailable && (
        <img
          {...props}
          ref={checkAlreadyLoaded}
          src={src}
          alt={alt}
          loading={loading}
          decoding={decoding}
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
