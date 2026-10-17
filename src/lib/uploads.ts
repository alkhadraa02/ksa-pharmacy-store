import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { MAX_UPLOAD_BYTES } from "./constants";

export type DetectedType = { mime: string; ext: string };

export class UploadError extends Error {}

export function uploadsDir(): string {
  return path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), "uploads", "prescriptions"));
}

/** Detects the real file type from magic bytes - the client-sent MIME type is never trusted. */
export function detectType(bytes: Uint8Array): DetectedType | null {
  const startsWith = (sig: number[], offset = 0) => sig.every((b, i) => bytes[offset + i] === b);
  if (bytes.length < 12) return null;
  if (startsWith([0x25, 0x50, 0x44, 0x46])) return { mime: "application/pdf", ext: "pdf" };
  if (startsWith([0xff, 0xd8, 0xff])) return { mime: "image/jpeg", ext: "jpg" };
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: "image/png", ext: "png" };
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) return { mime: "image/webp", ext: "webp" };
  return null;
}

export type SavedUpload = { fileName: string; mimeType: string; size: number; originalName: string };

export async function saveUpload(file: File): Promise<SavedUpload> {
  if (file.size === 0) throw new UploadError("الملف فارغ");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("حجم الملف أكبر من 5 ميجابايت");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectType(bytes);
  if (!type) throw new UploadError("نوع الملف غير مدعوم (PDF أو JPG أو PNG أو WebP فقط)");
  const dir = uploadsDir();
  await mkdir(dir, { recursive: true });
  const fileName = `${randomUUID()}.${type.ext}`;
  await writeFile(path.join(/*turbopackIgnore: true*/ dir, fileName), bytes, { flag: "wx" });
  const originalName = path.basename(file.name || "prescription").slice(0, 120);
  return { fileName, mimeType: type.mime, size: bytes.length, originalName };
}

export async function readUpload(fileName: string): Promise<Buffer | null> {
  if (!/^[0-9a-f-]{36}\.(pdf|jpg|png|webp)$/.test(fileName)) return null;
  try {
    return await readFile(path.join(/*turbopackIgnore: true*/ uploadsDir(), fileName));
  } catch {
    return null;
  }
}
