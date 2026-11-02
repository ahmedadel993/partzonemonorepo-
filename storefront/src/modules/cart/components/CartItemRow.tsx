"use client";

import { useTransition } from "react";
import { useCartStore } from "@/shared/stores/useCartStore";
import { updateCartItemQty, removeFromCart } from "@/modules/cart/actions/cartActions";
import type { CartItem } from "@/modules/cart/types";

export function CartItemRow({ item }: { item: CartItem }) {
  const { cart, setCart } = useCartStore();
  const [isPending, startTransition] = useTransition();

  const optimisticUpdate = (updater: (prev: CartItem[]) => CartItem[]) => {
    if (!cart) return;
    const newItems = updater(cart.items);
    const subTotal = newItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    setCart({ ...cart, items: newItems, subTotal, itemCount: newItems.reduce((s, i) => s + i.quantity, 0) });
  };

  const handleQtyChange = (delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      handleRemove();
      return;
    }
    optimisticUpdate((items) => items.map((i) => i.id === item.id ? { ...i, quantity: newQty, subTotal: i.unitPrice * newQty } : i));
    startTransition(async () => {
      const updated = await updateCartItemQty(item.id, newQty);
      if (updated) setCart(updated);
    });
  };

  const handleRemove = () => {
    optimisticUpdate((items) => items.filter((i) => i.id !== item.id));
    startTransition(async () => {
      const updated = await removeFromCart(item.id);
      if (updated) setCart(updated);
    });
  };

  return (
    <div className={`flex gap-3 py-3 border-b border-border last:border-0 ${isPending ? "opacity-60" : ""}`}>
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded shrink-0" />
      ) : (
        <div className="w-16 h-16 bg-surface-alt rounded shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text leading-snug line-clamp-2">{item.name}</p>
        <p className="text-xs text-text-muted font-mono mt-0.5" dir="ltr">{item.sku}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <button onClick={() => handleQtyChange(-1)} className="w-7 h-7 rounded border border-border text-text hover:bg-surface-alt transition-colors text-sm">−</button>
            <span className="w-8 text-center text-sm font-medium text-text">{item.quantity}</span>
            <button onClick={() => handleQtyChange(1)} className="w-7 h-7 rounded border border-border text-text hover:bg-surface-alt transition-colors text-sm">+</button>
          </div>
          <span className="text-sm font-semibold text-accent" dir="ltr">
            {item.subTotal.toFixed(2)} ج.م
          </span>
        </div>
      </div>
      <button onClick={handleRemove} aria-label="حذف" className="text-text-muted hover:text-danger transition-colors text-lg leading-none self-start shrink-0 p-1">
        ✕
      </button>
    </div>
  );
}
