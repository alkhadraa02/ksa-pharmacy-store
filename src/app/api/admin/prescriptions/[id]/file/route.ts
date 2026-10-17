import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/guard";
import { json } from "@/lib/http";
import { readUpload } from "@/lib/uploads";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(req);
  if ("error" in auth) return auth.error;
  const rx = await db.prescription.findUnique({ where: { id: (await ctx.params).id } });
  if (!rx || !rx.filePath) return json({ error: "لا يوجد ملف لهذه الوصفة" }, 404);
  const data = await readUpload(rx.filePath);
  if (!data) return json({ error: "الملف غير موجود" }, 404);
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": rx.mimeType,
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'",
    },
  });
}
