import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, findSessionUser } from "./auth";

export async function getAdmin() {
  const store = await cookies();
  const user = await findSessionUser(store.get(SESSION_COOKIE)?.value);
  return user && user.role === "ADMIN" ? user : null;
}

/** Call at the top of every dashboard page, server action and admin route. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  return admin;
}
