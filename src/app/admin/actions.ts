"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  getAdminSession,
  setAdminSession,
  verifyPassword
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/ebook-utils";

const uploadRoot = path.join(process.cwd(), "public", "uploads");

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getFormNumber(formData: FormData, key: string, fallback: number) {
  const value = Number.parseInt(getFormString(formData, key), 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function getUploadedFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (value instanceof File && value.size > 0) {
    return value;
  }

  return null;
}

function getExtension(file: File, fallback: string) {
  const originalExtension = path.extname(file.name).toLowerCase();

  if (originalExtension) {
    return originalExtension;
  }

  if (file.type === "image/jpeg") {
    return ".jpg";
  }

  if (file.type === "image/png") {
    return ".png";
  }

  if (file.type === "image/webp") {
    return ".webp";
  }

  return fallback;
}

async function saveUpload(file: File | null, folder: "covers" | "ebooks") {
  if (!file) {
    return null;
  }

  const isCover = folder === "covers";
  const isAllowed = isCover ? file.type.startsWith("image/") : file.type === "application/pdf";

  if (!isAllowed) {
    throw new Error(isCover ? "Cover upload must be an image." : "Ebook upload must be a PDF.");
  }

  const extension = getExtension(file, isCover ? ".jpg" : ".pdf");
  const baseName = slugify(path.parse(file.name).name) || folder;
  const fileName = `${Date.now()}-${baseName}${extension}`;
  const uploadDir = path.join(uploadRoot, folder);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), Buffer.from(await file.arrayBuffer()));

  return `/uploads/${folder}/${fileName}`;
}

async function requireAdmin() {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}

async function resolveUniqueSlug(baseSlug: string, ebookId?: string) {
  const normalizedSlug = slugify(baseSlug) || "ebook";
  let candidate = normalizedSlug;
  let suffix = 2;

  while (true) {
    const existing = await prisma.ebook.findUnique({
      where: { slug: candidate },
      select: { id: true }
    });

    if (!existing || existing.id === ebookId) {
      return candidate;
    }

    candidate = `${normalizedSlug}-${suffix}`;
    suffix += 1;
  }
}

function revalidateEbookViews(slug?: string) {
  revalidatePath("/");
  revalidatePath("/account");
  revalidatePath("/admin/dashboard");

  if (slug) {
    revalidatePath(`/ebooks/${slug}`);
  }
}

export async function loginAdminAction(formData: FormData) {
  const email = getFormString(formData, "email").toLowerCase();
  const password = getFormString(formData, "password");

  const admin = await prisma.adminUser.findUnique({
    where: { email }
  });

  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    redirect("/admin/login?error=1");
  }

  await setAdminSession(admin.id);
  redirect("/admin/dashboard");
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function saveEbookAction(formData: FormData) {
  await requireAdmin();

  const ebookId = getFormString(formData, "id");
  const title = getFormString(formData, "title");
  const author = getFormString(formData, "author");
  const category = getFormString(formData, "category");
  const description = getFormString(formData, "description");

  if (!title || !author || !category || !description) {
    throw new Error("Title, author, category, and description are required.");
  }

  const existing = ebookId
    ? await prisma.ebook.findUnique({
        where: { id: ebookId },
        select: { slug: true, pages: true, publishedYear: true }
      })
    : null;

  const slug = await resolveUniqueSlug(getFormString(formData, "slug") || title, ebookId || undefined);
  const uploadedCoverUrl = await saveUpload(getUploadedFile(formData, "coverFile"), "covers");
  const uploadedFileUrl = await saveUpload(getUploadedFile(formData, "ebookFile"), "ebooks");
  const coverImageUrl = uploadedCoverUrl ?? (getFormString(formData, "coverImageUrl") || null);
  const fileUrl = uploadedFileUrl ?? (getFormString(formData, "fileUrl") || null);
  const payload = {
    slug,
    title,
    author,
    category,
    description,
    pages: getFormNumber(formData, "pages", existing?.pages ?? 100),
    publishedYear: getFormNumber(formData, "publishedYear", existing?.publishedYear ?? new Date().getFullYear()),
    isPremium: getFormString(formData, "isPremium") === "on",
    fileUrl,
    coverImageUrl
  };

  const ebook = ebookId
    ? await prisma.ebook.update({
        where: { id: ebookId },
        data: payload
      })
    : await prisma.ebook.create({
        data: payload
      });

  revalidateEbookViews(existing?.slug);
  revalidateEbookViews(ebook.slug);
  redirect("/admin/dashboard");
}

export async function deleteEbookAction(formData: FormData) {
  await requireAdmin();

  const ebookId = getFormString(formData, "id");

  if (!ebookId) {
    throw new Error("Ebook id is required.");
  }

  const ebook = await prisma.ebook.delete({
    where: { id: ebookId }
  });

  revalidateEbookViews(ebook.slug);
  redirect("/admin/dashboard");
}
