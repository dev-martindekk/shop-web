import fs from "fs";
import path from "path";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

// Stored outside `public/` deliberately: this Next.js version snapshots the
// public folder's contents at server startup, so files written there while
// the server is already running never become servable until a restart.
// Files here are served live through /api/uploads/[filename] instead.
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);
const EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
};
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

async function uploadToCloudinary(buf: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "ezshop" },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error("cloudinary upload failed"));
        resolve(result.secure_url);
      }
    );
    stream.end(buf);
  });
}

// On serverless hosts (e.g. Netlify) the filesystem is read-only/ephemeral, so
// uploads go to Cloudinary when configured; local dev/Docker falls back to disk.
export async function saveUploadedImage(file: File): Promise<string> {
  if (!ALLOWED.has(file.type)) throw new Error("unsupported file type");
  if (file.size > MAX_SIZE) throw new Error("file too large");
  const buf = Buffer.from(await file.arrayBuffer());

  if (useCloudinary) {
    return uploadToCloudinary(buf);
  }

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const name = crypto.randomBytes(12).toString("hex") + EXT[file.type];
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
  return `/api/uploads/${name}`;
}
