"use client";

import { RaysSearchPanel } from "./RaysSearchPanel";

/** Full-screen search overlay — prefer navigating to `/search` from the header. */
export function RaysSearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return <RaysSearchPanel variant="overlay" onClose={onClose} />;
}
