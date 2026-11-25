import { useQuery } from "@apollo/client";
import { useParams, useRouter } from "@tanstack/react-router";
import { GET_VEHICLE_MAKE_BY_ID, GET_VEHICLE_MODELS } from "../graphql/catalogApi";
import { VehicleMake, VehicleModel } from "../vehicles/types";
import { useLanguage } from "@/contexts/LanguageContext";

export default function VehicleMakeDetailPage() {
  const params = useParams({ strict: false }) as { makeId?: string };
  const router = useRouter();
  const makeId = params.makeId ?? "";
  const { t } = useLanguage();

  const { data, loading } = useQuery<{ vehicleMakeById: VehicleMake | null }>(
    GET_VEHICLE_MAKE_BY_ID,
    { variables: { id: makeId }, skip: !makeId }
  );

  const { data: modelsData, loading: modelsLoading } = useQuery<{ vehicleModels: VehicleModel[] }>(
    GET_VEHICLE_MODELS,
    { variables: { makeId }, skip: !makeId }
  );

  const make = data?.vehicleMakeById;
  const models = modelsData?.vehicleModels ?? [];

  if (loading) return <div className="p-8 text-text-muted">{t("loading")}</div>;
  if (!make) return <div className="p-8 text-error">{t("notFound")}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <button
        onClick={() => router.history.back()}
        className="text-sm text-accent hover:underline"
      >
        {t("back")}
      </button>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-4">
          {make.logoUrl && (
            <img
              src={make.logoUrl}
              alt={make.name}
              className="w-16 h-16 object-contain rounded-lg border border-border p-1"
            />
          )}
          <div>
            <h1 className="text-xl font-bold text-text">{make.name}</h1>
            <p className="text-sm text-text-muted mt-1">/{make.slug}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-semibold text-text mb-4">{t("modelsHeading")}</h2>
        {modelsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-surface-alt rounded animate-pulse" />
            ))}
          </div>
        ) : models.length === 0 ? (
          <p className="text-sm text-text-muted">{t("noModels")}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted text-start">
                <th className="pb-3 font-medium pe-4 text-start">{t("fieldName")}</th>
                <th className="pb-3 font-medium text-start">Slug</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {models.map((m) => (
                <tr key={m.id} className="hover:bg-surface-alt transition-colors">
                  <td className="py-2.5 pe-4 text-text">{m.name}</td>
                  <td className="py-2.5 text-text-muted font-mono" dir="ltr">{m.slug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
