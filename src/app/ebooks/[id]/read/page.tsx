import { notFound } from "next/navigation";
import { EbookReader } from "@/components/ebook-reader";
import { getEbookBySlug } from "@/lib/ebooks";

export const dynamic = "force-dynamic";

export default async function EbookReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ebook = await getEbookBySlug(id);

  if (!ebook) {
    notFound();
  }

  return <EbookReader ebook={ebook} />;
}
