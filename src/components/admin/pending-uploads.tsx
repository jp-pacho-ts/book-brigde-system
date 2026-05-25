"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, ExternalLink, XCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PendingEbook = {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  description: string;
  pages: number;
  publishedYear: number;
  fileUrl: string | null;
  coverImageUrl: string | null;
  uploadedByEmail: string | null;
  createdAt: string;
};

export function PendingUploads() {
  const [ebooks, setEbooks] = useState<PendingEbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ebooks/pending", { credentials: "same-origin" });
      const data = await res.json() as PendingEbook[];
      if (Array.isArray(data)) setEbooks(data);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function act(id: string, action: "approve" | "reject") {
    setActing(id);
    try {
      await fetch(`/api/admin/ebooks/${id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      setEbooks((prev) => prev.filter((e) => e.id !== id));
    } catch { /* silent */ } finally {
      setActing(null);
    }
  }

  if (loading) return null;
  if (ebooks.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-700">
          <Clock size={13} />
          Pending Review
        </span>
        <span className="text-sm font-semibold text-muted-foreground">
          {ebooks.length} submission{ebooks.length !== 1 ? "s" : ""} awaiting approval
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
        <div className="divide-y">
          {ebooks.map((ebook) => (
            <div key={ebook.id} className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{ebook.title}</p>
                  <Badge variant="secondary">{ebook.category}</Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  by {ebook.author} &middot; {ebook.publishedYear} &middot; {ebook.pages} pages
                </p>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{ebook.description}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Submitted by <span className="font-medium">{ebook.uploadedByEmail ?? "unknown"}</span>
                </p>
                {ebook.fileUrl && (
                  <a
                    href={ebook.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <ExternalLink size={12} />
                    Preview PDF
                  </a>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                  disabled={acting === ebook.id}
                  onClick={() => act(ebook.id, "reject")}
                >
                  <XCircle size={14} />
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 bg-green-600 hover:bg-green-700"
                  disabled={acting === ebook.id}
                  onClick={() => act(ebook.id, "approve")}
                >
                  <CheckCircle2 size={14} />
                  Approve
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
