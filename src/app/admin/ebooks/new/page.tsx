import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdminSession } from "@/lib/admin-auth";
import { EbookForm } from "@/components/admin/ebook-form";

export default async function NewEbookPage() {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <main className="surface-line">
      <section className="mx-auto max-w-7xl px-4 py-8">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to dashboard
        </Link>

        <div className="mt-6">
          <EbookForm />
        </div>
      </section>
    </main>
  );
}
