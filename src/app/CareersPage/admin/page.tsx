import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifySessionCookieValue } from "@/lib/adminAuth";
import { AdminDashboardClient } from "./AdminDashboardClient";

export const metadata = {
  title: "Careers Admin | UFirm Estates",
};

export default async function CareersAdminDashboard() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!verifySessionCookieValue(session)) {
    redirect("/CareersPage/admin/login");
  }

  return <AdminDashboardClient />;
}
