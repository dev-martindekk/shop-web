import { redirect } from "next/navigation";
import { verifyAdminOrNull } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await verifyAdminOrNull();
  if (!admin) redirect("/login");
  return <AdminShell adminName={admin.name}>{children}</AdminShell>;
}
