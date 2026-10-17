import { db } from "@/lib/db";
import { sameOrigin } from "@/lib/guard";
import { clientIp, json, rateLimit, TOO_MANY } from "@/lib/http";
import { UploadError, saveUpload } from "@/lib/uploads";
import { firstIssue, prescriptionFieldsSchema } from "@/lib/validation";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "طلب غير مسموح" }, 403);
  if (!rateLimit(`rx:${clientIp(req)}`, 8, 10 * 60_000)) return json({ error: TOO_MANY }, 429);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "بيانات النموذج غير صحيحة" }, 400);
  }
  const fields = prescriptionFieldsSchema.safeParse({ name: form.get("name"), phone: form.get("phone") });
  if (!fields.success) return json({ error: firstIssue(fields.error) }, 400);
  const file = form.get("file");
  if (!(file instanceof File)) return json({ error: "اختر ملف الوصفة" }, 400);

  try {
    const saved = await saveUpload(file);
    const rx = await db.prescription.create({
      data: {
        customerName: fields.data.name,
        phone: fields.data.phone,
        filePath: saved.fileName,
        originalName: saved.originalName,
        mimeType: saved.mimeType,
        size: saved.size,
      },
    });
    return json({ id: rx.id, status: rx.status }, 201);
  } catch (e) {
    if (e instanceof UploadError) return json({ error: e.message }, 400);
    console.error("upload failed", e);
    return json({ error: "تعذّر رفع الوصفة" }, 500);
  }
}
