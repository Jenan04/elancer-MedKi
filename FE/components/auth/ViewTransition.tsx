"use client";

import { ReactNode, useEffect, useState } from "react";

/**
 * Remounts on `viewKey` change and fades/slides the new view in.
 * No animation libraries required — just a class toggle timed
 * after mount so the browser registers the initial state first.
 */
export function ViewTransition({
  viewKey,
  children,
}: {
  viewKey: string;
  children: ReactNode;
}) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    setEntered(false);
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [viewKey]);

  return (
    <div
      key={viewKey}
      className={`transition-all duration-300 ease-out ${
        entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}