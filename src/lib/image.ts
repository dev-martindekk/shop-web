"use client";

// Mobile photos are often huge (12MP+, several MB) and larger than the
// server's upload limit. Downscale client-side before upload so photos
// straight from a phone camera just work without the user resizing manually.
export async function resizeImageFile(file: File, maxDim = 1600, quality = 0.85): Promise<File> {
  if (file.type === "image/svg+xml" || file.type === "image/gif" || !file.type.startsWith("image/")) {
    return file;
  }
  try {
    const bitmap = await createImageBitmap(file);
    if (bitmap.width <= maxDim && bitmap.height <= maxDim) {
      bitmap.close();
      return file;
    }
    const scale = maxDim / Math.max(bitmap.width, bitmap.height);
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const outType = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, outType, quality));
    if (!blob) return file;

    const base = file.name.replace(/\.[^.]+$/, "");
    const ext = outType === "image/png" ? ".png" : ".jpg";
    return new File([blob], base + ext, { type: outType });
  } catch {
    return file;
  }
}
