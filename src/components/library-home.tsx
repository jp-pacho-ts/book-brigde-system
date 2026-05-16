"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookMarked,
  BookText,
  Crown,
  Library,
  LockKeyhole,
  Search,
  Sparkles
} from "lucide-react";
import { EbookCover } from "@/components/ebook-cover";
import { useAuth } from "@/components/auth-provider";
import { categories, ebooks, type Ebook } from "@/lib/ebooks";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function LibraryHome() {
  const { isSubscribed } = useAuth();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filteredEbooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return ebooks.filter((ebook) => {
      const matchesCategory = category === "All" || ebook.category === category;
      const matchesSearch =
        !normalizedQuery ||
        [ebook.title, ebook.author, ebook.category, ebook.description]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [category, query]);

  return (
    <main className="surface-line">
      <section className="border-b bg-background">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:py-12">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="gap-2 rounded-full px-3 py-1">
              <Sparkles size={14} aria-hidden="true" />
              BookBridge Library
            </Badge>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              Find the right ebook faster.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Search a curated shelf of study, business, finance, and research titles. Upgrade when
              you want full access to premium reading.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/subscribe">
                <Button>
                  <Crown size={16} aria-hidden="true" />
                  View plans
                </Button>
              </Link>
              <Link href="#catalog">
                <Button variant="outline">
                  Browse catalog
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>
              </Link>
            </div>

            <div className="mt-7 max-w-2xl rounded-lg border bg-background p-2 shadow-sm">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={20}
                  aria-hidden="true"
                />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search ebooks, authors, or categories"
                  className="h-14 border-0 bg-background pl-12 text-base shadow-none"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm font-medium transition",
                    category === item
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Card className="bg-foreground p-5 text-background shadow-soft">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-normal text-background/60">
                    Recommended shelf
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">Student learning picks</h2>
                </div>
                <span className="grid h-12 w-12 place-items-center rounded-lg bg-background/10">
                  <Library size={24} aria-hidden="true" />
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {ebooks.slice(0, 3).map((ebook) => (
                  <Link key={ebook.id} href={`/ebooks/${ebook.id}`} className="block">
                    <EbookCover ebook={ebook} compact />
                  </Link>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Metric label="Titles" value={ebooks.length.toString()} />
                <Metric label="Premium" value={ebooks.filter((ebook) => ebook.isPremium).length.toString()} />
                <Metric label="Status" value={isSubscribed ? "Open" : "Free"} />
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b bg-background">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 md:grid-cols-3">
          <FeaturePill title="Focused catalog" description="Only practical ebooks for student work." />
          <FeaturePill title="Fast discovery" description="Search by topic, author, or learning area." />
          <FeaturePill title="Premium shelf" description="Clear access labels before you open a title." />
        </div>
      </section>

      <section id="catalog" className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">Catalog</p>
            <h2 className="mt-1 text-3xl font-semibold text-foreground">Available ebooks</h2>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Showing {filteredEbooks.length} of {ebooks.length} titles
          </p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredEbooks.map((ebook) => (
            <EbookCard key={ebook.id} ebook={ebook} isSubscribed={isSubscribed} />
          ))}
        </div>

        {filteredEbooks.length === 0 ? (
          <Card className="mt-10 p-10 text-center">
            <BookText className="mx-auto text-muted-foreground" size={44} aria-hidden="true" />
            <p className="mt-3 text-xl font-semibold text-foreground">No ebooks found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try another keyword or category.</p>
          </Card>
        ) : null}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-background/10 bg-background/10 p-3">
      <p className="text-2xl font-semibold text-background">{value}</p>
      <p className="text-xs font-medium uppercase tracking-normal text-background/65">{label}</p>
    </div>
  );
}

function FeaturePill({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <BadgeCheck size={17} aria-hidden="true" />
      </span>
      <span>
        <span className="block font-semibold text-foreground">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-muted-foreground">{description}</span>
      </span>
    </div>
  );
}

function EbookCard({ ebook, isSubscribed }: { ebook: Ebook; isSubscribed: boolean }) {
  const locked = ebook.isPremium && !isSubscribed;

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <CardHeader className="p-3">
        <EbookCover ebook={ebook} />
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-5 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{ebook.category}</Badge>
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

        <h2 className="mt-3 text-xl font-semibold leading-snug text-foreground">{ebook.title}</h2>
        <p className="mt-1 text-sm font-medium text-muted-foreground">by {ebook.author}</p>
        <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{ebook.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-ink/10 pt-4 text-sm">
          <span className="rounded-md bg-muted px-3 py-2 font-medium text-muted-foreground">{ebook.pages} pages</span>
          <span className="rounded-md bg-muted px-3 py-2 text-right font-medium text-muted-foreground">
            {ebook.publishedYear}
          </span>
        </div>

        {locked ? (
          <Link href="/subscribe" className="mt-4">
            <Button variant="secondary" className="w-full">
              <LockKeyhole size={16} aria-hidden="true" />
              Upgrade to read
            </Button>
          </Link>
        ) : (
          <Link href={`/ebooks/${ebook.id}`} className="mt-4">
            <Button className="w-full">
              <BookMarked size={16} aria-hidden="true" />
              Open title
              <ArrowRight
                className="transition group-hover:translate-x-0.5"
                size={16}
                aria-hidden="true"
              />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
