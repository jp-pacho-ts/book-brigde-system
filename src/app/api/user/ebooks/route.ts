import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SUBSCRIPTION_COOKIE = "bookbridge_demo_subscription";
const USER_EMAIL_COOKIE = "bookbridge_user_email";

function jsonResponse(payload: unknown, status = 200) {
  return NextResponse.json(payload, { status, headers: { "Cache-Control": "no-store" } });
}

async function getSubscribedUserEmail(): Promise<string | null> {
  const jar = await cookies();
  if (jar.get(SUBSCRIPTION_COOKIE)?.value !== "active") return null;
  const raw = jar.get(USER_EMAIL_COOKIE)?.value;
  return raw ? decodeURIComponent(raw) : null;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string) {
  let slug = slugify(base);
  let exists = await prisma.ebook.findUnique({ where: { slug } });
  let i = 2;
  while (exists) {
    slug = `${slugify(base)}-${i++}`;
    exists = await prisma.ebook.findUnique({ where: { slug } });
  }
  return slug;
}

/* GET /api/user/ebooks — list the current user's uploads */
export async function GET() {
  const email = await getSubscribedUserEmail();
  if (!email) return jsonResponse({ error: "Premium membership required." }, 403);

  const ebooks = await prisma.ebook.findMany({
    where: { uploadedByEmail: email },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      author: true,
      category: true,
      status: true,
      coverImageUrl: true,
      createdAt: true,
    },
  });

  return jsonResponse(ebooks);
}

/* POST /api/user/ebooks — submit a new ebook for review */
export async function POST(request: Request) {
  const email = await getSubscribedUserEmail();
  if (!email) return jsonResponse({ error: "Premium membership required." }, 403);

  const body = await request.json() as {
    title?: string;
    author?: string;
    category?: string;
    description?: string;
    pages?: number;
    publishedYear?: number;
    fileUrl?: string;
    coverImageUrl?: string;
  };

  const { title, author, category, description, pages, publishedYear, fileUrl, coverImageUrl } = body;

  if (!title || !author || !category || !description || !fileUrl) {
    return jsonResponse({ error: "title, author, category, description, and fileUrl are required." }, 400);
  }

  const slug = await uniqueSlug(title);

  const ebook = await prisma.ebook.create({
    data: {
      slug,
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      description: description.trim(),
      pages: Number(pages) || 0,
      publishedYear: Number(publishedYear) || new Date().getFullYear(),
      isPremium: true,
      fileUrl,
      coverImageUrl: coverImageUrl ?? null,
      status: "PENDING",
      uploadedByEmail: email,
    },
  });

  return jsonResponse({ ok: true, ebook }, 201);
}
