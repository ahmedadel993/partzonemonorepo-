"use client";

import { useCartStore } from "@/shared/stores/useCartStore";

export function CartIconButton({ label }: { label: string }) {
  const { toggleDrawer, itemCount } = useCartStore();
  const count = itemCount();

  return (
    <button
      type="button"
      onClick={toggleDrawer}
      aria-label={label}
      className="relative p-2 rounded hover:bg-surface-alt transition-colors"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-accent-fg text-[10px] font-bold leading-[18px] text-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
