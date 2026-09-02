"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ReadMoreProps {
  text: string;
  className?: string;
}

const COLLAPSED_LINES = 4;

export function ReadMore({ text, className = "" }: ReadMoreProps) {
  const [expanded, setExpanded] = useState(false);

  const long = text.split("\n").length > COLLAPSED_LINES || text.length > 260;

  return (
    <div className={`max-w-prose ${className}`}>
      <p
        className={`whitespace-pre-line text-sm leading-[1.75] text-slate-600 ${
          !expanded && long ? "line-clamp-4" : ""
        }`}
      >
        {text}
      </p>
      {long && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-accent transition-colors hover:text-accent-dark"
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              Read less
              <ChevronUp size={14} aria-hidden />
            </>
          ) : (
            <>
              Read more
              <ChevronDown size={14} aria-hidden />
            </>
          )}
        </button>
      )}
    </div>
  );
}
