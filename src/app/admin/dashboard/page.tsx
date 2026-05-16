import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookOpen,
  Crown,
  Edit3,
  FilePlus2,
  Image,
  LibraryBig,
  Trash2,
  UserCog
} from "lucide-react";
import { deleteEbookAction } from "@/app/admin/actions";
import { getAdminSession, isSuperAdmin } from "@/lib/admin-auth";
import { listEbooks } from "@/lib/ebooks";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [admin, ebooks] = await Promise.all([getAdminSession(), listEbooks()]);

  if (!admin) {
    redirect("/admin/login");
  }

  const premiumCount = ebooks.filter((ebook) => ebook.isPremium).length;
  const canManageAdmins = isSuperAdmin(admin);
  const adminCount = canManageAdmins ? await prisma.adminUser.count() : null;

  return (
    <main className="surface-line">
      <section className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge variant="secondary" className="gap-2 rounded-full px-3 py-1">
                <LibraryBig size={14} aria-hidden="true" />
                Admin dashboard
              </Badge>
              <h1 className="mt-5 text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                Ebook catalog
              </h1>
              <p className="mt-2 text-base text-muted-foreground">
                Signed in as {admin.name} ({admin.email})
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/admin/ebooks/new">
                <Button>
                  <FilePlus2 size={16} aria-hidden="true" />
                  Add ebook
                </Button>
              </Link>
              {canManageAdmins ? (
                <Link href="/admin/admins">
                  <Button variant="secondary">
                    <UserCog size={16} aria-hidden="true" />
                    Admin accounts
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <Metric icon={<BookOpen size={22} aria-hidden="true" />} label="Total ebooks" value={ebooks.length} />
            <Metric icon={<Crown size={22} aria-hidden="true" />} label="Premium" value={premiumCount} />
            <Metric icon={<LibraryBig size={22} aria-hidden="true" />} label="Free" value={ebooks.length - premiumCount} />
            {adminCount !== null ? (
              <Metric icon={<UserCog size={22} aria-hidden="true" />} label="Admin users" value={adminCount} />
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
          <div className="grid grid-cols-[1.35fr_0.85fr_0.7fr_0.8fr_120px] gap-4 border-b bg-muted px-4 py-3 text-xs font-semibold uppercase tracking-normal text-muted-foreground max-lg:hidden">
            <span>Title</span>
            <span>Category</span>
            <span>Access</span>
            <span>Files</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y">
            {ebooks.map((ebook) => (
              <div
                key={ebook.id}
                className="grid gap-4 px-4 py-4 lg:grid-cols-[1.35fr_0.85fr_0.7fr_0.8fr_120px] lg:items-center"
              >
                <div className="min-w-0">
                  <Link
                    href={`/ebooks/${ebook.slug}`}
                    className="font-semibold text-foreground hover:text-primary"
                  >
                    {ebook.title}
                  </Link>
                  <p className="mt-1 truncate text-sm text-muted-foreground">by {ebook.author}</p>
                </div>

                <div>
                  <Badge variant="secondary">{ebook.category}</Badge>
                </div>

                <div>
                  {ebook.isPremium ? (
                    <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-800">
                      <Crown size={13} aria-hidden="true" />
                      Premium
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                      Free
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                    <BookOpen size={14} aria-hidden="true" />
                    {ebook.fileUrl ? "PDF" : "No PDF"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                    <Image size={14} aria-hidden="true" />
                    {ebook.coverImageUrl ? "Cover" : "Generated"}
                  </span>
                </div>

                <div className="flex items-center gap-2 lg:justify-end">
                  <Link href={`/admin/ebooks/${ebook.id}/edit`}>
                    <Button size="icon" variant="outline" title="Edit ebook">
                      <Edit3 size={16} aria-hidden="true" />
                    </Button>
                  </Link>
                  <form action={deleteEbookAction}>
                    <input type="hidden" name="id" value={ebook.id} />
                    <Button size="icon" variant="destructive" title="Delete ebook" type="submit">
                      <Trash2 size={16} aria-hidden="true" />
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>

        {ebooks.length === 0 ? (
          <Card className="mt-8 p-10 text-center">
            <CardContent className="p-0">
              <p className="text-xl font-semibold text-foreground">No ebooks yet</p>
              <p className="mt-2 text-sm text-muted-foreground">Add your first ebook to publish it in the library.</p>
              <Link href="/admin/ebooks/new" className="mt-5 inline-flex">
                <Button>Add ebook</Button>
              </Link>
            </CardContent>
          </Card>
        ) : null}
      </section>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <Card className="p-5">
      <div className="text-primary">{icon}</div>
      <p className="mt-4 text-4xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-sm font-medium uppercase tracking-normal text-muted-foreground">{label}</p>
    </Card>
  );
}
