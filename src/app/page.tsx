import { LibraryHome } from "@/components/library-home";
import { listEbooks } from "@/lib/ebooks";
import { getCategoriesFromEbooks } from "@/lib/ebook-utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  const ebooks = await listEbooks();
  const categories = getCategoriesFromEbooks(ebooks);

  return <LibraryHome ebooks={ebooks} categories={categories} />;
}
