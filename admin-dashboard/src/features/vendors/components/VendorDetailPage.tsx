import { useQuery, useMutation } from "@apollo/client";
import { useParams, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  GET_VENDOR_BY_ID,
  APPROVE_VENDOR,
  SUSPEND_VENDOR,
} from "@/features/identity/graphql/identityApi";
import { useLanguage } from "@/contexts/LanguageContext";

interface Vendor {
  id: string;
  userId: string;
  companyName: string;
  taxId: string | null;
  phoneNumber: string | null;
  commissionRate: number;
  status: "Pending" | "Approved" | "Suspended";
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  Pending:  "bg-warning/15 text-warning",
  Approved: "bg-success/15 text-success",
  Suspended:"bg-error/15 text-error",
};

export default function VendorDetailPage() {
  const params = useParams({ strict: false }) as { vendorId?: string };
  const router = useRouter();
  const vendorId = params.vendorId ?? "";
  const { t } = useLanguage();

  const { data, loading, refetch } = useQuery<{ gqlVendorById: Vendor | null }>(
    GET_VENDOR_BY_ID,
    { variables: { id: vendorId }, skip: !vendorId }
  );

  const [approveVendor] = useMutation(APPROVE_VENDOR);
  const [suspendVendor] = useMutation(SUSPEND_VENDOR);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vendor = data?.gqlVendorById;

  const handleApprove = async () => {
    if (!vendor) return;
    setBusy(true);
    setError(null);
    try {
      const res = await approveVendor({ variables: { id: vendor.id } });
      const errs = res.data?.approveVendor?.errors ?? [];
      if (errs.length) setError(errs[0]);
      else refetch();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };

  const handleSuspend = async () => {
    if (!vendor) return;
    setBusy(true);
    setError(null);
    try {
      const res = await suspendVendor({ variables: { id: vendor.id } });
      const errs = res.data?.suspendVendor?.errors ?? [];
      if (errs.length) setError(errs[0]);
      else refetch();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="p-8 text-text-muted">{t("loading")}</div>;
  if (!vendor) return <div className="p-8 text-error">{t("notFound")}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <button
        onClick={() => router.history.back()}
        className="text-sm text-accent hover:underline"
      >
        {t("back")}
      </button>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-text">{vendor.companyName}</h1>
            <p className="text-xs text-text-muted mt-1">
              {t("createdAt")}: {new Date(vendor.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[vendor.status] ?? "bg-border text-text-muted"}`}>
            {vendor.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {vendor.taxId && (
            <div>
              <p className="text-xs text-text-muted">{t("vendorTaxId")}</p>
              <p className="text-text font-mono">{vendor.taxId}</p>
            </div>
          )}
          {vendor.phoneNumber && (
            <div>
              <p className="text-xs text-text-muted">{t("vendorPhone")}</p>
              <p className="text-text">{vendor.phoneNumber}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-text-muted">{t("vendorCommission")}</p>
            <p className="text-text">{vendor.commissionRate}%</p>
          </div>
        </div>

        {error && (
          <p className="text-xs text-error bg-error/10 rounded p-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          {vendor.status !== "Approved" && (
            <button
              onClick={handleApprove}
              disabled={busy}
              className="bg-success hover:bg-success/80 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
            >
              {t("vendorApprove")}
            </button>
          )}
          {vendor.status !== "Suspended" && (
            <button
              onClick={handleSuspend}
              disabled={busy}
              className="bg-error hover:bg-error/80 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
            >
              {t("vendorSuspend")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
