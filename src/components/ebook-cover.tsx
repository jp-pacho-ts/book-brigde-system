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
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 text-white">
          <p className={`${compact ? "text-[10px]" : "text-xs"} font-black uppercase tracking-normal opacity-80`}>
            {ebook.category}
          </p>
          <h3 className={`${compact ? "text-lg" : "text-2xl"} mt-1 font-black leading-tight`}>
            {ebook.title}
          </h3>
        </div>
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
      <div className="absolute bottom-5 left-12 right-5">
        <p className={`${compact ? "text-[10px]" : "text-xs"} font-black uppercase tracking-normal opacity-75`}>
          {ebook.category}
        </p>
        <h3 className={`${compact ? "text-lg" : "text-3xl"} mt-2 font-black leading-tight`}>
          {ebook.title}
        </h3>
        <p className={`${compact ? "mt-2" : "mt-3"} text-xs font-bold opacity-75`}>{ebook.author}</p>
      </div>
    </div>
  );
}
