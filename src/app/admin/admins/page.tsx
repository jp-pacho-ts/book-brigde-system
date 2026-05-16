import Link from "next/link";
import { redirect } from "next/navigation";
import { Edit3, ShieldCheck, Trash2, UserCog } from "lucide-react";
import { deleteAdminUserAction } from "@/app/admin/admins/actions";
import { getAdminSession, isSuperAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { AdminUserForm } from "@/components/admin/admin-user-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const pageErrorMessages: Record<string, string> = {
  missing: "Admin account not found.",
  "self-delete": "You cannot delete the admin account you are signed in with.",
  "last-super-admin": "At least one superadmin must remain.",
  required: "Name and email are required.",
  password: "New admin passwords must be at least 6 characters.",
  email: "That admin email is already in use."
};

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [currentAdmin, params] = await Promise.all([getAdminSession(), searchParams]);

  if (!currentAdmin) {
    redirect("/admin/login");
  }

  if (!isSuperAdmin(currentAdmin)) {
    redirect("/admin/dashboard");
  }

  const adminUsers = await prisma.adminUser.findMany({
    orderBy: [{ role: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  return (
    <main className="surface-line">
      <section className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Badge variant="secondary" className="gap-2 rounded-full px-3 py-1">
            <ShieldCheck size={14} aria-hidden="true" />
            Superadmin
          </Badge>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Admin accounts
          </h1>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">
            Create admin users for catalog management and choose who can manage other admins.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[390px_1fr]">
        <AdminUserForm error={params.error} />

        <div className="space-y-4">
          {params.error && pageErrorMessages[params.error] ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {pageErrorMessages[params.error]}
            </p>
          ) : null}

          <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
            <div className="grid grid-cols-[1fr_170px_170px_120px] gap-4 border-b bg-muted px-4 py-3 text-xs font-semibold uppercase tracking-normal text-muted-foreground max-lg:hidden">
              <span>Account</span>
              <span>Role</span>
              <span>Created</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y">
              {adminUsers.map((adminUser) => (
                <div
                  key={adminUser.id}
                  className="grid gap-4 px-4 py-4 lg:grid-cols-[1fr_170px_170px_120px] lg:items-center"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{adminUser.name}</p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{adminUser.email}</p>
                  </div>

                  <div>
                    <RoleBadge role={adminUser.role} />
                  </div>

                  <p className="text-sm font-medium text-muted-foreground">
                    {adminUser.createdAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </p>

                  <div className="flex items-center gap-2 lg:justify-end">
                    <Link href={`/admin/admins/${adminUser.id}/edit`}>
                      <Button size="icon" variant="outline" title="Edit admin">
                        <Edit3 size={16} aria-hidden="true" />
                      </Button>
                    </Link>
                    <form action={deleteAdminUserAction}>
                      <input type="hidden" name="id" value={adminUser.id} />
                      <Button
                        size="icon"
                        variant="destructive"
                        title="Delete admin"
                        type="submit"
                        disabled={adminUser.id === currentAdmin.id}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {adminUsers.length === 0 ? (
            <Card className="p-8 text-center">
              <UserCog className="mx-auto text-muted-foreground" size={36} aria-hidden="true" />
              <p className="mt-3 font-semibold text-foreground">No admin accounts found</p>
            </Card>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function RoleBadge({ role }: { role: "SUPER_ADMIN" | "ADMIN" }) {
  if (role === "SUPER_ADMIN") {
    return (
      <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
        Superadmin
      </Badge>
    );
  }

  return <Badge variant="secondary">Admin</Badge>;
}
