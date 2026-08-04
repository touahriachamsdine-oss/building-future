import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSettingsClient from "./AdminSettingsClient";

export const metadata = {
  title: "إعدادات النظام | لوحة المشرف",
  description: "التحكم بخصائص المنصة وإعدادات الأمان وقاعدة البيانات",
};

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== 'ADMIN') {
    redirect("/dashboard");
  }

  return <AdminSettingsClient />;
}
