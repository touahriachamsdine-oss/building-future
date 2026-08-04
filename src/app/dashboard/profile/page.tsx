import { getCurrentUser } from "@/lib/auth";
import { getProfile } from "@/lib/db";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export const metadata = {
  title: "الملف الشخصي | بناء المستقبل",
  description: "عرض وتحديث ملفك الشخصي على منصة بناء المستقبل",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile(user.id);

  if (!profile) {
    redirect("/login");
  }

  const typedProfile = {
    id: String(profile.id || ""),
    role: String(profile.role || ""),
    full_name: (profile.full_name as string | null) || null,
    phone: (profile.phone as string | null) || null,
    wilaya: typeof profile.wilaya === 'number' ? profile.wilaya : null,
    baladia: (profile.baladia as string | null) || null,
    avatar_url: (profile.avatar_url as string | null) || null,
    bio: (profile.bio as string | null) || null,
    provider_type: (profile.provider_type as string | null) || null,
    specialty: (profile.specialty as string | null) || null,
  };

  return <ProfileClient initialProfile={typedProfile} />;
}
