import { useQuery } from "@apollo/client";
import { useParams, useRouter } from "@tanstack/react-router";
import { GET_VEHICLE_MODEL_BY_ID } from "../graphql/catalogApi";
import { VehicleModel } from "../vehicles/types";
import { useLanguage } from "@/contexts/LanguageContext";

export default function VehicleModelDetailPage() {
  const params = useParams({ strict: false }) as { modelId?: string };
  const router = useRouter();
  const modelId = params.modelId ?? "";
  const { t } = useLanguage();

  const { data, loading } = useQuery<{ vehicleModelById: VehicleModel | null }>(
    GET_VEHICLE_MODEL_BY_ID,
    { variables: { id: modelId }, skip: !modelId }
  );

  const model = data?.vehicleModelById;

  if (loading) return <div className="p-8 text-text-muted">{t("loading")}</div>;
  if (!model) return <div className="p-8 text-error">{t("notFound")}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <button
        onClick={() => router.history.back()}
        className="text-sm text-accent hover:underline"
      >
        {t("back")}
      </button>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-3">
        <div>
          <h1 className="text-xl font-bold text-text">{model.name}</h1>
          <p className="text-sm text-text-muted mt-1">/{model.slug}</p>
        </div>
      </div>
    </div>
  );
}
