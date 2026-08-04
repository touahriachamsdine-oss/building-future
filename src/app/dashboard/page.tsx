import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
  } else if (user.role === "PROVIDER") {
    redirect("/dashboard/provider");
  } else {
    redirect("/dashboard/client");
  }
}
