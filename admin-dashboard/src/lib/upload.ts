const API = import.meta.env.VITE_API_URL ?? "/api/v1";

export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";
const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadImage(file: File): Promise<string> {
  if (!ACCEPTED_IMAGE_TYPES.split(",").includes(file.type))
    throw new Error("format");
  if (file.size > MAX_BYTES)
    throw new Error("size"); // size error – caught by ImageUploadField using t("uploadErrorSize")

  const body = new FormData();
  body.append("file", file);

  const token = localStorage.getItem("pz_access_token");
  const res = await fetch(`${API}/admin/uploads`, {
    method: "POST",
    body,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    if (res.status === 401 || res.status === 403) throw new Error("unauth");
    throw new Error(data?.error ?? `upload_failed_${res.status}`);
  }

  const { url } = (await res.json()) as { url: string };
  return url;
}
