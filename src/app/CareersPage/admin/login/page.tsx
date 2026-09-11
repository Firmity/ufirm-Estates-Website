import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifySessionCookieValue } from "@/lib/adminAuth";
import { AdminLoginForm } from "../LoginForm";

export const metadata = {
  title: "Admin Login | UFirm Careers",
};

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (verifySessionCookieValue(session)) {
    redirect("/CareersPage/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafbf9] px-4 pt-[64px]">
      <div className="bg-white p-8 rounded-[8px] shadow-lg border border-[#f0f3f5] w-full max-w-sm">
        <h1 className="text-xl font-bold mb-6 text-center text-[#1e3143]">Careers Admin Login</h1>
        <AdminLoginForm />
      </div>
    </div>
  );
}
