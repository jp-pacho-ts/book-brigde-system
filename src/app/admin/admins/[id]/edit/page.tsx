import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdminSession, isSuperAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { AdminUserForm } from "@/components/admin/admin-user-form";

export const dynamic = "force-dynamic";

export default async function EditAdminUserPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [currentAdmin, resolvedParams, resolvedSearchParams] = await Promise.all([
    getAdminSession(),
    params,
    searchParams
  ]);

  if (!currentAdmin) {
    redirect("/admin/login");
  }

  if (!isSuperAdmin(currentAdmin)) {
    redirect("/admin/dashboard");
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { id: resolvedParams.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });

  if (!adminUser) {
    notFound();
  }

  return (
    <main className="surface-line">
      <section className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/admin/admins" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to admin accounts
        </Link>

        <div className="mt-6">
          <AdminUserForm adminUser={adminUser} error={resolvedSearchParams.error} />
        </div>
      </section>
    </main>
  );
}
