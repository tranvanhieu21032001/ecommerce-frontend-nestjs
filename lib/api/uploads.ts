import { apiRequest } from "@/lib/api/client";

export type UploadImageResponse = {
  publicId: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
};

export async function uploadImage(
  file: File,
  folder = "uploads",
): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const params = new URLSearchParams({ folder });

  return apiRequest<UploadImageResponse>(`/api/v1/uploads/image?${params}`, {
    method: "POST",
    body: formData,
  });
}
