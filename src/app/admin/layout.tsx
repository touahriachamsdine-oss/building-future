import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import AdminShell from "./AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
