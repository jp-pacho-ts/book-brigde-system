"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { upload } from "@vercel/blob/client";
import type { Ebook } from "@/lib/ebooks";
import { saveEbookAction } from "@/app/admin/actions";
import { slugify } from "@/lib/ebook-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EbookFormProps = {
  ebook?: Ebook;
};

export function EbookForm({ ebook }: EbookFormProps) {
  const isEditing = Boolean(ebook);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") ?? "ebook");
    const slug = slugify(String(formData.get("slug") ?? "") || title) || "ebook";
    const coverFile = getFile(formData, "coverFile");
    const ebookFile = getFile(formData, "ebookFile");

    try {
      if (coverFile) {
        setStatus("Uploading cover image...");
        const coverBlob = await upload(`bookbridge/covers/${slug}-${coverFile.name}`, coverFile, {
          access: "public",
          handleUploadUrl: "/api/admin/blob-upload"
        });

        formData.set("coverImageUrl", coverBlob.url);
      }

      if (ebookFile) {
        if (ebookFile.type !== "application/pdf") {
          setError("PDF upload must use a PDF file.");
          return;
        }

        setStatus("Uploading PDF to Vercel Blob...");
        const ebookBlob = await upload(`bookbridge/ebooks/${slug}-${ebookFile.name}`, ebookFile, {
          access: "public",
          handleUploadUrl: "/api/admin/blob-upload"
        });

        formData.set("fileUrl", ebookBlob.url);
      }

      formData.delete("coverFile");
      formData.delete("ebookFile");

      setStatus("Saving ebook...");
      await saveEbookAction(formData);
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "Upload failed. Make sure Vercel Blob is connected to this project.";

      setError(message);
      setStatus("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <input type="hidden" name="id" value={ebook?.id ?? ""} />

      <Card className="shadow-soft">
        <CardHeader className="border-b">
          <h1 className="text-3xl font-semibold text-foreground">
            {isEditing ? "Edit ebook" : "Add ebook"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Save the catalog details readers see in the library cards.
          </p>
        </CardHeader>

        <CardContent className="grid gap-5 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="title">
              <Input id="title" name="title" defaultValue={ebook?.title} required />
            </Field>

            <Field label="Author" htmlFor="author">
              <Input id="author" name="author" defaultValue={ebook?.author} required />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Slug" htmlFor="slug">
              <Input
                id="slug"
                name="slug"
                defaultValue={ebook?.slug}
                placeholder="auto-generated-from-title"
              />
            </Field>

            <Field label="Category" htmlFor="category">
              <Input
                id="category"
                name="category"
                defaultValue={ebook?.category}
                placeholder="Mechanical Engineering"
                required
              />
            </Field>
          </div>

          <Field label="Description" htmlFor="description">
            <textarea
              id="description"
              name="description"
              defaultValue={ebook?.description}
              className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Pages" htmlFor="pages">
              <Input id="pages" name="pages" type="number" min={1} defaultValue={ebook?.pages ?? 100} required />
            </Field>

            <Field label="Published year" htmlFor="publishedYear">
              <Input
                id="publishedYear"
                name="publishedYear"
                type="number"
                min={1000}
                max={9999}
                defaultValue={ebook?.publishedYear ?? new Date().getFullYear()}
                required
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader className="border-b">
            <h2 className="text-xl font-semibold text-foreground">Access</h2>
            <p className="text-sm text-muted-foreground">Choose whether the ebook is free or premium.</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <label className="flex items-start gap-3 rounded-lg border bg-muted/50 p-4 text-sm font-medium text-foreground">
              <input
                name="isPremium"
                type="checkbox"
                defaultChecked={ebook?.isPremium}
                className="mt-1 h-4 w-4 accent-primary"
              />
              <span>
                <span className="block">Requires subscription</span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  Leave unchecked to make this ebook free.
                </span>
              </span>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <h2 className="text-xl font-semibold text-foreground">Files</h2>
            <p className="text-sm text-muted-foreground">
              Uploads go directly to Vercel Blob, then the hosted URL is saved.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <Field label="Cover image URL" htmlFor="coverImageUrl">
              <Input
                id="coverImageUrl"
                name="coverImageUrl"
                defaultValue={ebook?.coverImageUrl ?? ""}
                placeholder="https://..."
              />
            </Field>

            <Field label="Upload cover image" htmlFor="coverFile">
              <Input id="coverFile" name="coverFile" type="file" accept="image/png,image/jpeg,image/webp" />
            </Field>

            <Field label="PDF URL" htmlFor="fileUrl">
              <Input
                id="fileUrl"
                name="fileUrl"
                defaultValue={ebook?.fileUrl ?? ""}
                placeholder="https://..."
              />
            </Field>

            <Field label="Upload PDF" htmlFor="ebookFile">
              <Input id="ebookFile" name="ebookFile" type="file" accept="application/pdf" />
            </Field>

            {status ? (
              <p className="rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">{status}</p>
            ) : null}

            {error ? (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {error}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Button type="submit" className="h-11 w-full" disabled={Boolean(status)}>
          {status ? "Working..." : isEditing ? "Save changes" : "Create ebook"}
        </Button>
      </div>
    </form>
  );
}

function getFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (value instanceof File && value.size > 0) {
    return value;
  }

  return null;
}

function Field({
  label,
  htmlFor,
  children
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
