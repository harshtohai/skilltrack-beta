"use client";

import * as React from "react";

/**
 * Column count per design §4.14: container width ÷ pitch (ResizeObserver);
 * dot size never scales, count does. Falls back to `fallback` before the
 * first measurement (SSR) so there is no zero-width flash.
 */
export function useDotColumns(pitch: number, fallback: number) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [columns, setColumns] = React.useState(fallback);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setColumns(Math.max(1, Math.floor(el.clientWidth / pitch)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pitch]);

  return { ref, columns };
}
