import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export const metadata = {
  title: "الإعدادات | بناء المستقبل",
  description: "إدارة تفضيلات حسابك وتحديث كلمة المرور على منصة بناء المستقبل",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <SettingsClient />;
}
