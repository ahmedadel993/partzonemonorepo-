"use client";

import { useState, useTransition } from "react";
import { getMyAddresses, addAddress } from "@/modules/checkout/actions/checkoutActions";
import type { Address } from "@/modules/auth/types";
import type { ShippingAddressInput } from "@/modules/checkout/types";

interface Props {
  initialAddresses: Address[];
  onSelect: (address: ShippingAddressInput) => void;
  selectedId?: string | null;
}

export function AddressSelector({ initialAddresses, onSelect, selectedId }: Props) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [selected, setSelected] = useState<string | null>(selectedId ?? addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null);
  const [isPending, startTransition] = useTransition();

  const [newAddr, setNewAddr] = useState<ShippingAddressInput>({
    fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", governorate: "", postalCode: "",
  });
  const [addError, setAddError] = useState<string | null>(null);

  const handleSelect = (id: string, address: Address) => {
    setSelected(id);
    onSelect({
      fullName: address.label,
      phone: "",
      addressLine1: address.streetLine1,
      addressLine2: address.streetLine2 ?? undefined,
      city: address.city,
      governorate: address.governorate,
      postalCode: address.postalCode,
    });
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    startTransition(async () => {
      const result = await addAddress({
        label: newAddr.fullName,
        streetLine1: newAddr.addressLine1,
        streetLine2: newAddr.addressLine2,
        city: newAddr.city,
        governorate: newAddr.governorate,
        postalCode: newAddr.postalCode,
        isDefault: addresses.length === 0,
      });
      if (!result) {
        setAddError("فشل حفظ العنوان، يرجى المحاولة مجدداً");
        return;
      }
      const updated = await getMyAddresses();
      setAddresses(updated);
      setShowForm(false);
      onSelect(newAddr);
    });
  };

  const inputCls = "w-full h-10 px-3 rounded-md bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors";

  return (
    <div className="space-y-3">
      {addresses.map((addr) => (
        <label key={addr.id} className={[
          "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
          selected === addr.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/50",
        ].join(" ")}>
          <input type="radio" name="address" value={addr.id} checked={selected === addr.id}
            onChange={() => handleSelect(addr.id, addr)} className="mt-1 accent-[var(--color-accent)]" />
          <div>
            <p className="text-sm font-medium text-text">{addr.label}</p>
            <p className="text-xs text-text-muted mt-0.5">{addr.streetLine1}{addr.streetLine2 ? `، ${addr.streetLine2}` : ""}</p>
            <p className="text-xs text-text-muted">{addr.city}، {addr.governorate} {addr.postalCode}</p>
          </div>
        </label>
      ))}

      {!showForm ? (
        <button type="button" onClick={() => setShowForm(true)} className="text-sm text-accent hover:underline flex items-center gap-1">
          + إضافة عنوان جديد
        </button>
      ) : (
        <form onSubmit={handleAddAddress} className="space-y-3 p-4 rounded-lg border border-border bg-surface-alt">
          <p className="text-sm font-medium text-text">عنوان جديد</p>
          <div className="grid grid-cols-2 gap-3">
            <input value={newAddr.fullName} onChange={(e) => setNewAddr((p) => ({ ...p, fullName: e.target.value }))} placeholder="الاسم الكامل" required className={inputCls} />
            <input value={newAddr.phone} onChange={(e) => setNewAddr((p) => ({ ...p, phone: e.target.value }))} placeholder="رقم الهاتف" required className={inputCls} dir="ltr" />
          </div>
          <input value={newAddr.addressLine1} onChange={(e) => setNewAddr((p) => ({ ...p, addressLine1: e.target.value }))} placeholder="العنوان (السطر الأول)" required className={inputCls} />
          <input value={newAddr.addressLine2} onChange={(e) => setNewAddr((p) => ({ ...p, addressLine2: e.target.value }))} placeholder="العنوان (السطر الثاني — اختياري)" className={inputCls} />
          <div className="grid grid-cols-3 gap-3">
            <input value={newAddr.city} onChange={(e) => setNewAddr((p) => ({ ...p, city: e.target.value }))} placeholder="المدينة" required className={inputCls} />
            <input value={newAddr.governorate} onChange={(e) => setNewAddr((p) => ({ ...p, governorate: e.target.value }))} placeholder="المحافظة" required className={inputCls} />
            <input value={newAddr.postalCode} onChange={(e) => setNewAddr((p) => ({ ...p, postalCode: e.target.value }))} placeholder="الرمز البريدي" required className={inputCls} dir="ltr" />
          </div>
          {addError && <p className="text-xs text-danger">{addError}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="h-9 px-4 bg-accent text-accent-fg text-sm font-medium rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50">
              {isPending ? "جاري الحفظ..." : "حفظ العنوان"}
            </button>
            {addresses.length > 0 && (
              <button type="button" onClick={() => setShowForm(false)} className="h-9 px-4 border border-border text-text text-sm rounded-md hover:bg-surface-alt transition-colors">
                إلغاء
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
