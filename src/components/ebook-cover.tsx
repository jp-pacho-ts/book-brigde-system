import type { Ebook } from "@/lib/ebooks";
import { BookOpen } from "lucide-react";

const accentStyles = {
  palm: "from-palm via-palm to-ink text-white",
  coral: "from-coral via-coral to-ink text-white",
  sun: "from-sun via-sun to-coral text-ink",
  ink: "from-ink via-ink to-palm text-white"
};

export function EbookCover({ ebook, compact = false }: { ebook: Ebook; compact?: boolean }) {
  const coverHeight = compact ? "h-40" : "h-60";

  if (ebook.coverImageUrl) {
    return (
      <div className={`relative overflow-hidden rounded-lg bg-muted shadow-inner ${coverHeight}`}>
        <img
          src={ebook.coverImageUrl}
          alt={`${ebook.title} ebook cover`}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br shadow-inner ${accentStyles[ebook.accent]} ${coverHeight}`}
      aria-label={`${ebook.title} ebook cover`}
    >
      <div className="absolute inset-y-0 left-0 w-8 bg-black/18" />
      <div className="absolute left-8 top-0 h-full w-px bg-white/20" />
      <div className="absolute inset-x-8 top-5 h-px bg-white/25" />
      <div className="absolute bottom-5 right-5 h-24 w-24 rounded-lg border border-white/25 bg-white/10" />
      <div className="absolute right-8 top-8 grid h-11 w-11 place-items-center rounded-lg bg-white/15 backdrop-blur">
        <BookOpen size={compact ? 18 : 22} aria-hidden="true" />
      </div>
    </div>
  );
}
