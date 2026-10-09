"use client";

import { useEffect, useRef, useState } from "react";

const CLAMP_CLASSES = {
  3: "line-clamp-3",
  4: "line-clamp-4",
};

// Long text clamped to a few lines with "Lire la suite" / "Réduire" (C07).
// The toggle only appears when the text actually overflows.
export default function ExpandableText({ text, lines = 3, className = "" }) {
  const textRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return undefined;

    const measure = () => {
      if (isExpanded) return;
      setIsOverflowing(element.scrollHeight > element.clientHeight + 1);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isExpanded, text]);

  if (!text) return null;

  return (
    <div>
      <p
        ref={textRef}
        className={`${className} ${isExpanded ? "" : CLAMP_CLASSES[lines] || "line-clamp-3"}`}
      >
        {text}
      </p>
      {isOverflowing || isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded((value) => !value)}
          aria-expanded={isExpanded}
          className="mt-2 text-sm font-semibold text-accent underline-offset-4 hover:underline font-body"
        >
          {isExpanded ? "Réduire" : "Lire la suite"}
        </button>
      ) : null}
    </div>
  );
}
