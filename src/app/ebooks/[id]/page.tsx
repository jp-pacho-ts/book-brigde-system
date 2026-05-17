import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, CalendarDays, Crown, FileText, Library, UserRound } from "lucide-react";
import { EbookCover } from "@/components/ebook-cover";
import { EbookReadAction } from "@/components/ebook-read-action";
import { getEbookBySlug } from "@/lib/ebooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function EbookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ebook = await getEbookBySlug(id);

  if (!ebook) {
    notFound();
  }

  return (
    <main className="surface-line">
      <section className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to library
          </Link>

          <div className="mt-7 grid gap-8 lg:grid-cols-[390px_1fr] lg:items-center">
            <div className="max-w-sm">
              <EbookCover ebook={ebook} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Library size={13} aria-hidden="true" />
                  {ebook.category}
                </Badge>
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

              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                {ebook.title}
              </h1>
              <p className="mt-3 inline-flex items-center gap-2 text-lg font-medium text-muted-foreground">
                <UserRound size={18} aria-hidden="true" />
                {ebook.author}
              </p>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{ebook.description}</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <DetailMetric icon={<FileText size={20} aria-hidden="true" />} label="Pages" value={ebook.pages.toString()} />
                <DetailMetric
                  icon={<CalendarDays size={20} aria-hidden="true" />}
                  label="Published"
                  value={ebook.publishedYear.toString()}
                />
                <DetailMetric
                  icon={<Crown size={20} aria-hidden="true" />}
                  label="Access"
                  value={ebook.isPremium ? "Premium" : "Free"}
                />
              </div>

              <div className="mt-6">
                <EbookReadAction fileUrl={ebook.fileUrl} isPremium={ebook.isPremium} slug={ebook.slug} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <CardContent className="p-5">
            <h2 className="text-xl font-semibold text-foreground">About this ebook</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Review the key details before opening a title or moving back to the full catalog.
            </p>
            <Link href="/" className="mt-5 inline-flex">
              <Button>Browse more titles</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 border-b pb-4">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen size={20} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Reader preview</h2>
                <p className="text-sm text-muted-foreground">Sample reading layout</p>
              </div>
            </div>

            <div className="mt-5 rounded-lg bg-muted p-5">
              <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">Chapter 1</p>
              <h3 className="mt-2 text-2xl font-semibold text-foreground">{ebook.title}</h3>
              <div className="mt-5 space-y-3 text-sm leading-7 text-muted-foreground">
                <p>
                  This preview gives readers a clean place to scan the title before continuing into
                  the full ebook experience.
                </p>
                <p>
                  Access labels in the catalog make it clear which titles are free and which ones
                  require premium access.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function DetailMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Card className="bg-muted/60 p-4">
      <div className="text-primary">{icon}</div>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">{label}</p>
    </Card>
  );
}
