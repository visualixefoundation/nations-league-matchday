"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const INTERVAL_MS = 75_000; // ~75s — between 60–90s, gentle on free-tier cache

/** Silently refreshes the RSC tree while any match is live. */
export default function LiveAutoRefresh({ active }: { active: boolean }) {
  const router = useRouter();
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    if (!active) return;

    const id = setInterval(() => {
      if (activeRef.current) router.refresh();
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, [active, router]);

  return null;
}
