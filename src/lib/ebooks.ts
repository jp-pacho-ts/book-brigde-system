import type { Ebook as PrismaEbook } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAccentForSlug, type EbookAccent } from "@/lib/ebook-utils";

export type Ebook = {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  description: string;
  pages: number;
  publishedYear: number;
  isPremium: boolean;
  fileUrl: string | null;
  coverImageUrl: string | null;
  accent: EbookAccent;
  createdAt: string;
  updatedAt: string;
};

export function formatEbook(ebook: PrismaEbook): Ebook {
  return {
    id: ebook.id,
    slug: ebook.slug,
    title: ebook.title,
    author: ebook.author,
    category: ebook.category,
    description: ebook.description,
    pages: ebook.pages,
    publishedYear: ebook.publishedYear,
    isPremium: ebook.isPremium,
    fileUrl: ebook.fileUrl,
    coverImageUrl: ebook.coverImageUrl,
    accent: getAccentForSlug(ebook.slug),
    createdAt: ebook.createdAt.toISOString(),
    updatedAt: ebook.updatedAt.toISOString()
  };
}

export async function listEbooks() {
  const ebooks = await prisma.ebook.findMany({
    orderBy: [{ category: "asc" }, { title: "asc" }]
  });

  return ebooks.map(formatEbook);
}

export async function getEbookBySlug(slug: string) {
  const ebook = await prisma.ebook.findUnique({
    where: { slug }
  });

  return ebook ? formatEbook(ebook) : null;
}

export async function getEbookStats() {
  const [total, premium] = await Promise.all([
    prisma.ebook.count(),
    prisma.ebook.count({ where: { isPremium: true } })
  ]);

  return {
    total,
    premium,
    free: total - premium
  };
}
