"use client";

import { upload } from "@vercel/blob/client";
import { ArrowLeft, BookUp, CheckCircle2, Crown, Upload } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CURRENT_YEAR = new Date().getFullYear();

const CATEGORIES = [
  "Business",
  "Technology",
  "Finance",
  "Academic",
  "Science",
  "Engineering",
  "Health",
  "Self-Help",
  "History",
  "Other",
];

export default function UploadPage() {
  const { isSubscribed, isReady } = useAuth();

  if (!isReady) return null;

  if (!isSubscribed) {
    return (
      <main className="flex min-h-[calc(100svh-65px)] flex-col items-center justify-center gap-6 px-6 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-3xl bg-amber-100 text-amber-600">
          <Crown size={36} />
        </span>
        <h1 className="text-3xl font-extrabold">Premium Feature</h1>
        <p className="max-w-sm text-muted-foreground">
          Uploading ebooks is available to premium members only. Upgrade your
          account to start sharing your knowledge.
        </p>
        <Link href="/subscribe">
          <Button size="lg" className="gap-2">
            <Crown size={18} />
            View Subscription Plans
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to library
      </Link>

      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-palm">
          Premium Upload
        </p>
        <h1 className="mt-1.5 text-4xl font-extrabold">Share an Ebook</h1>
        <p className="mt-2 text-muted-foreground">
          Your submission will be reviewed by our team before appearing in the
          library.
        </p>
      </div>

      <UploadForm />
    </main>
  );
}

function UploadForm() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setStatus("");

    const form = e.currentTarget;
    const fd = new FormData(form);

    const title = String(fd.get("title") ?? "").trim();
    const author = String(fd.get("author") ?? "").trim();
    const category = String(fd.get("category") ?? "").trim();
    const description = String(fd.get("description") ?? "").trim();
    const pages = Number(fd.get("pages"));
    const publishedYear = Number(fd.get("publishedYear"));
    const coverFile = getFile(fd, "coverFile");
    const ebookFile = getFile(fd, "ebookFile");

    if (!ebookFile) {
      setError("A PDF file is required.");
      return;
    }

    try {
      let coverImageUrl: string | undefined;
      let fileUrl: string;

      const slugBase = title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 60) || "ebook";

      if (coverFile) {
        setStatus("Uploading cover image…");
        const ext = coverFile.name.includes(".") ? coverFile.name.slice(coverFile.name.lastIndexOf(".")) : "";
        const blob = await upload(`bookbridge/user-covers/${slugBase}${ext}`, coverFile, {
          access: "public",
          contentType: coverFile.type,
          handleUploadUrl: "/api/user/upload-blob",
        });
        coverImageUrl = blob.url;
      }

      setStatus("Uploading PDF… 0%");
      const pdfBlob = await upload(`bookbridge/user-ebooks/${slugBase}.pdf`, ebookFile, {
        access: "public",
        contentType: "application/pdf",
        handleUploadUrl: "/api/user/upload-blob",
        onUploadProgress: ({ percentage }) => {
          setStatus(`Uploading PDF… ${Math.round(percentage)}%`);
        },
      });
      fileUrl = pdfBlob.url;

      setStatus("Submitting for review…");
      const res = await fetch("/api/user/ebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author, category, description, pages, publishedYear, fileUrl, coverImageUrl }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error ?? "Submission failed.");
      }

      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("");
    }
  }

  if (done) {
    return (
      <Card className="py-16 text-center shadow-soft">
        <CardContent className="flex flex-col items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 size={32} />
          </span>
          <h2 className="text-2xl font-bold">Submitted for Review!</h2>
          <p className="max-w-sm text-muted-foreground">
            Our team will review your ebook and publish it shortly. You can track
            the status in your account dashboard.
          </p>
          <div className="mt-2 flex gap-3">
            <Link href="/account">
              <Button variant="outline">My Uploads</Button>
            </Link>
            <Link href="/">
              <Button>Browse Library</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="shadow-soft">
        <CardHeader className="border-b">
          <h2 className="text-xl font-semibold">Book Details</h2>
        </CardHeader>
        <CardContent className="grid gap-5 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="title">
              <Input id="title" name="title" placeholder="e.g. Introduction to Physics" required />
            </Field>
            <Field label="Author" htmlFor="author">
              <Input id="author" name="author" placeholder="e.g. Jane Smith" required />
            </Field>
          </div>

          <Field label="Category" htmlFor="category">
            <select
              id="category"
              name="category"
              required
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Description" htmlFor="description">
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              placeholder="A short summary of the book…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Number of pages" htmlFor="pages">
              <Input id="pages" name="pages" type="number" min={1} defaultValue={100} required />
            </Field>
            <Field label="Published year" htmlFor="publishedYear">
              <Input id="publishedYear" name="publishedYear" type="number" min={1000} max={CURRENT_YEAR} defaultValue={CURRENT_YEAR} required />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader className="border-b">
          <h2 className="text-xl font-semibold">Files</h2>
          <p className="text-sm text-muted-foreground">PDF is required. Cover image is optional.</p>
        </CardHeader>
        <CardContent className="grid gap-5 pt-6">
          <Field label="PDF file *" htmlFor="ebookFile">
            <Input id="ebookFile" name="ebookFile" type="file" accept="application/pdf" required />
          </Field>
          <Field label="Cover image (optional)" htmlFor="coverFile">
            <Input id="coverFile" name="coverFile" type="file" accept="image/png,image/jpeg,image/webp" />
          </Field>

          {status && (
            <p className="rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">{status}</p>
          )}
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full gap-2" disabled={Boolean(status)}>
        {status ? (
          "Working…"
        ) : (
          <>
            <Upload size={18} />
            Submit for Review
          </>
        )}
      </Button>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function getFile(fd: FormData, key: string) {
  const v = fd.get(key);
  return v instanceof File && v.size > 0 ? v : null;
}
