import type { ReactNode } from "react";
import type { Ebook } from "@/lib/ebooks";
import { saveEbookAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EbookFormProps = {
  ebook?: Ebook;
};

export function EbookForm({ ebook }: EbookFormProps) {
  const isEditing = Boolean(ebook);

  return (
    <form action={saveEbookAction} className="grid gap-6 lg:grid-cols-[1fr_360px]">
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
            <p className="text-sm text-muted-foreground">Upload local files or paste hosted URLs.</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <Field label="Cover image URL" htmlFor="coverImageUrl">
              <Input
                id="coverImageUrl"
                name="coverImageUrl"
                defaultValue={ebook?.coverImageUrl ?? ""}
                placeholder="/uploads/covers/book.jpg"
              />
            </Field>

            <Field label="Upload cover image" htmlFor="coverFile">
              <Input id="coverFile" name="coverFile" type="file" accept="image/*" />
            </Field>

            <Field label="PDF URL" htmlFor="fileUrl">
              <Input
                id="fileUrl"
                name="fileUrl"
                defaultValue={ebook?.fileUrl ?? ""}
                placeholder="/uploads/ebooks/book.pdf"
              />
            </Field>

            <Field label="Upload PDF" htmlFor="ebookFile">
              <Input id="ebookFile" name="ebookFile" type="file" accept="application/pdf" />
            </Field>
          </CardContent>
        </Card>

        <Button type="submit" className="h-11 w-full">
          {isEditing ? "Save changes" : "Create ebook"}
        </Button>
      </div>
    </form>
  );
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
