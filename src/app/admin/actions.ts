"use server";

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

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getFormNumber(formData: FormData, key: string, fallback: number) {
  const value = Number.parseInt(getFormString(formData, key), 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
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
  const coverImageUrl = getFormString(formData, "coverImageUrl") || null;
  const fileUrl = getFormString(formData, "fileUrl") || null;
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
