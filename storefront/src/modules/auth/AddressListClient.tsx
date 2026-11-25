"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Address } from "@/modules/auth/types/index";
import { addressSchema, type AddressForm } from "@/modules/auth/schemas";

interface Labels {
  default: string;
  delete: string;
  edit: string;
  setDefault: string;
  save: string;
  cancel: string;
  descLabel: string;
  descPlaceholder: string;
  line1Label: string;
  line1Placeholder: string;
  line2Label: string;
  line2Placeholder: string;
  cityLabel: string;
  cityPlaceholder: string;
  governorateLabel: string;
  postalCodeLabel: string;
}

interface Props {
  addresses: Address[];
  handleDelete: (formData: FormData) => Promise<void>;
  handleUpdate: (formData: FormData) => Promise<void>;
  handleSetDefault: (formData: FormData) => Promise<void>;
  labels: Labels;
}

function EditAddressForm({
  address,
  labels,
  handleUpdate,
  onCancel,
}: {
  address: Address;
  labels: Labels;
  handleUpdate: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: address.label,
      streetLine1: address.streetLine1,
      streetLine2: address.streetLine2 ?? "",
      city: address.city,
      governorate: address.governorate,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
    },
  });

  const onSubmit = (vals: AddressForm) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("addressId", address.id);
      fd.append("label", vals.label);
      fd.append("streetLine1", vals.streetLine1);
      fd.append("streetLine2", vals.streetLine2 ?? "");
      fd.append("city", vals.city);
      fd.append("governorate", vals.governorate);
      fd.append("postalCode", vals.postalCode);
      await handleUpdate(fd);
      onCancel();
    });
  };

  const inp = "w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-3 pt-3 border-t border-border">
      <div>
        <label className="block text-xs text-text-muted mb-1">{labels.descLabel}</label>
        <input className={inp} placeholder={labels.descPlaceholder} {...register("label")} />
        {errors.label && <p className="text-xs text-danger mt-0.5">{errors.label.message}</p>}
      </div>
      <div>
        <label className="block text-xs text-text-muted mb-1">{labels.line1Label}</label>
        <input className={inp} placeholder={labels.line1Placeholder} {...register("streetLine1")} />
        {errors.streetLine1 && <p className="text-xs text-danger mt-0.5">{errors.streetLine1.message}</p>}
      </div>
      <div>
        <label className="block text-xs text-text-muted mb-1">{labels.line2Label}</label>
        <input className={inp} placeholder={labels.line2Placeholder} {...register("streetLine2")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-text-muted mb-1">{labels.cityLabel}</label>
          <input className={inp} placeholder={labels.cityPlaceholder} {...register("city")} />
          {errors.city && <p className="text-xs text-danger mt-0.5">{errors.city.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">{labels.governorateLabel}</label>
          <input className={inp} placeholder={labels.cityPlaceholder} {...register("governorate")} />
          {errors.governorate && <p className="text-xs text-danger mt-0.5">{errors.governorate.message}</p>}
        </div>
      </div>
      <div>
        <label className="block text-xs text-text-muted mb-1">{labels.postalCodeLabel}</label>
        <input className={inp} dir="ltr" placeholder="11511" {...register("postalCode")} />
        {errors.postalCode && <p className="text-xs text-danger mt-0.5">{errors.postalCode.message}</p>}
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs border border-border rounded-lg text-text-muted hover:border-accent hover:text-text transition-colors"
        >
          {labels.cancel}
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-3 py-1.5 text-xs bg-accent text-accent-fg rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors"
        >
          {labels.save}
        </button>
      </div>
    </form>
  );
}

export function AddressListClient({ addresses, handleDelete, handleUpdate, handleSetDefault, labels }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [settingDefaultId, startDefaultTransition] = useTransition();

  const onSetDefault = (addressId: string) => {
    startDefaultTransition(async () => {
      const fd = new FormData();
      fd.append("addressId", addressId);
      await handleSetDefault(fd);
    });
  };

  return (
    <div className="space-y-3">
      {addresses.map((addr) => (
        <div
          key={addr.id}
          className="bg-surface border border-border rounded-xl p-5 space-y-1"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold text-text">{addr.label}</p>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {addr.isDefault && (
                <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full font-medium">
                  {labels.default}
                </span>
              )}
              {!addr.isDefault && (
                <button
                  type="button"
                  onClick={() => onSetDefault(addr.id)}
                  disabled={settingDefaultId}
                  className="text-xs text-text-muted hover:text-accent transition-colors disabled:opacity-50"
                >
                  {labels.setDefault}
                </button>
              )}
              <button
                type="button"
                onClick={() => setEditingId(editingId === addr.id ? null : addr.id)}
                className="text-xs text-accent hover:underline transition-colors"
              >
                {labels.edit}
              </button>
              <form action={handleDelete}>
                <input type="hidden" name="addressId" value={addr.id} />
                <button
                  type="submit"
                  className="text-xs text-danger/70 hover:text-danger transition-colors"
                >
                  {labels.delete}
                </button>
              </form>
            </div>
          </div>
          <p className="text-sm text-text-muted">
            {addr.streetLine1}{addr.streetLine2 ? `، ${addr.streetLine2}` : ""}
          </p>
          <p className="text-sm text-text-muted">{addr.city}، {addr.governorate} {addr.postalCode}</p>

          {editingId === addr.id && (
            <EditAddressForm
              address={addr}
              labels={labels}
              handleUpdate={handleUpdate}
              onCancel={() => setEditingId(null)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
