import { MAX_IMAGE_BYTES, MAX_SOURCE_BYTES } from "./imageLimits";

export interface PreparedImage { image: string; mimeType: "image/jpeg"; preview: string }

/** Decode locally, resize and re-encode: no upload and no source EXIF metadata. */
export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!file.size || file.size > MAX_SOURCE_BYTES) throw new Error("errorSize");
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
  if (!allowed.includes(file.type.toLowerCase()) && !(file.type === "" && /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name))) {
    throw new Error("errorType");
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    if (!img.naturalWidth || !img.naturalHeight || img.naturalWidth * img.naturalHeight > 80_000_000) {
      throw new Error("errorGeneric");
    }
    let side = 2048;
    for (let attempt = 0; attempt < 4; attempt++) {
      const ratio = Math.min(1, side / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.naturalWidth * ratio));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * ratio));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("errorGeneric");
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const preview = canvas.toDataURL("image/jpeg", 0.88);
      const image = preview.split(",")[1];
      if (image && image.length * 3 / 4 <= MAX_IMAGE_BYTES) return { image, mimeType: "image/jpeg", preview };
      side = Math.round(side * 0.75);
    }
    throw new Error("errorSize");
  } catch (error) {
    if (error instanceof Error && ["errorSize", "errorType", "errorGeneric"].includes(error.message)) throw error;
    throw new Error("errorGeneric");
  } finally {
    URL.revokeObjectURL(url);
  }
}
