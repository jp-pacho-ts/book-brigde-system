import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createAdminUploadToken, getAdminSession } from "@/lib/admin-auth";
import { formatEbook } from "@/lib/ebooks";
import { prisma } from "@/lib/prisma";
import { EbookForm } from "@/components/admin/ebook-form";

export const dynamic = "force-dynamic";

export default async function EditEbookPage({ params }: { params: Promise<{ id: string }> }) {
  const [admin, resolvedParams] = await Promise.all([getAdminSession(), params]);

  if (!admin) {
    redirect("/admin/login");
  }

  const ebook = await prisma.ebook.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!ebook) {
    notFound();
  }

  return (
    <main className="surface-line">
      <section className="mx-auto max-w-7xl px-4 py-8">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to dashboard
        </Link>

        <div className="mt-6">
          <EbookForm ebook={formatEbook(ebook)} uploadAuthToken={createAdminUploadToken(admin.id)} />
        </div>
      </section>
    </main>
  );
}
