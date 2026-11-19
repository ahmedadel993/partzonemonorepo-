import { useRef, useState } from "react";
import { ACCEPTED_IMAGE_TYPES, uploadImage } from "@/lib/upload";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

/** Image picker: upload a file (or paste a URL), with preview and remove. */
export function ImageUploadField({ label, value, onChange }: Props) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      onChange(await uploadImage(file));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "size") setError(t("uploadErrorSize"));
      else if (msg === "unauth") setError(t("uploadErrorUnauth"));
      else if (msg === "format") setError(t("uploadErrorFormat"));
      else setError(msg || t("imageUploadFail"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-xs text-text-muted mb-1">{label}</label>
      <div className="flex items-start gap-3">
        <div className="w-20 h-20 shrink-0 rounded border border-border bg-surface-alt overflow-hidden flex items-center justify-center">
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-text-muted">{t("noImage")}</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-surface-alt border border-border rounded text-xs text-text hover:border-accent transition-colors disabled:opacity-50"
            >
              {uploading ? t("uploading") : value ? t("changeImage") : t("uploadImage")}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="px-3 py-1.5 text-xs text-text-muted hover:text-danger transition-colors"
              >
                {t("removeImage")}
              </button>
            )}
          </div>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t("pasteUrlPlaceholder")}
            dir="ltr"
            className="w-full bg-surface-alt border border-border rounded px-2 py-1 text-xs text-text"
          />
          {error && <p className="text-danger text-xs">{error}</p>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
