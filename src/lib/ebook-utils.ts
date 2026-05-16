export const ebookAccents = ["palm", "coral", "sun", "ink"] as const;

export type EbookAccent = (typeof ebookAccents)[number];

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function getAccentForSlug(slug: string): EbookAccent {
  const total = slug.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return ebookAccents[total % ebookAccents.length];
}

export function getCategoriesFromEbooks(ebooks: { category: string }[]) {
  return ["All", ...Array.from(new Set(ebooks.map((ebook) => ebook.category).filter(Boolean)))];
}
