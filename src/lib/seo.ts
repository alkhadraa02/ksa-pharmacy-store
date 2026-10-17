import { SITE_NAME } from "./constants";

/** Keeps a meta description inside the 50-160 character window search engines display. */
export function metaDescription(text: string): string {
  let t = text.replace(/\s+/g, " ").trim();
  if (t.length < 50) t = `${t} — تسوّق من ${SITE_NAME} مع توصيل سريع داخل المملكة.`;
  if (t.length > 160) t = `${t.slice(0, 157).trimEnd()}…`;
  return t;
}

export function shortTitle(title: string, max = 44): string {
  const t = title.trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

export function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}
