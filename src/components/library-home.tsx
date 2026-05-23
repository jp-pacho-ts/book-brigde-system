"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookMarked,
  BookOpen,
  BookText,
  ChevronLeft,
  ChevronRight,
  Crown,
  GraduationCap,
  Layers,
  LockKeyhole,
  Search,
  Sparkles,
} from "lucide-react";
import { EbookCover } from "@/components/ebook-cover";
import { useAuth } from "@/components/auth-provider";
import type { Ebook } from "@/lib/ebooks";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const EBOOKS_PER_PAGE = 9;
const PER_VIEW = 4;

const HERO_SLIDES = [
  {
    id: 0,
    eyebrow: "BookBridge Digital Library",
    title: "Your Gateway to Knowledge",
    subtitle:
      "Access thousands of curated ebooks across business, technology, finance, and academic disciplines.",
    primary: { label: "Explore Free Books", href: "#catalog" },
    secondary: { label: "View Plans", href: "/subscribe" },
  },
  {
    id: 1,
    eyebrow: "Premium Membership",
    title: "Unlimited Reading, One Subscription",
    subtitle:
      "Get instant access to our entire premium library with one simple subscription. Cancel anytime.",
    primary: { label: "Start Premium", href: "/subscribe" },
    secondary: { label: "Browse Catalog", href: "#catalog" },
  },
  {
    id: 2,
    eyebrow: "Curated for Learners",
    title: "Handpicked for Academic Excellence",
    subtitle:
      "Expert-selected titles to help students and professionals reach their full potential.",
    primary: { label: "Browse Catalog", href: "#catalog" },
    secondary: { label: "View Plans", href: "/subscribe" },
  },
] as const;

const BOOK_POSITIONS = [
  { top: "18%", left: "8%", rotate: "-9deg", z: 2, scale: 0.88 },
  { top: "8%", left: "35%", rotate: "-3deg", z: 4, scale: 1 },
  { top: "24%", left: "64%", rotate: "7deg", z: 3, scale: 0.92 },
  { top: "55%", left: "20%", rotate: "4deg", z: 2, scale: 0.84 },
  { top: "51%", left: "55%", rotate: "-7deg", z: 3, scale: 0.95 },
];

export function LibraryHome({ ebooks, categories }: { ebooks: Ebook[]; categories: string[] }) {
  const { isSubscribed } = useAuth();

  /* ── catalog state ── */
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);

  /* ── hero carousel state ── */
  const [heroSlide, setHeroSlide] = useState(0);
  const heroIntervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  /* ── featured carousel state ── */
  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselPage, setCarouselPage] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const totalCarouselPages = Math.ceil(ebooks.length / PER_VIEW);

  /* ── catalog filtering ── */
  const filteredEbooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ebooks.filter((ebook) => {
      const matchesCategory = activeCategory === "All" || ebook.category === activeCategory;
      const matchesSearch =
        !q ||
        [ebook.title, ebook.author, ebook.category, ebook.description]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, ebooks, query]);

  const totalPages = Math.max(1, Math.ceil(filteredEbooks.length / EBOOKS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * EBOOKS_PER_PAGE;
  const paginatedEbooks = filteredEbooks.slice(pageStart, pageStart + EBOOKS_PER_PAGE);
  const visibleStart = filteredEbooks.length === 0 ? 0 : pageStart + 1;
  const visibleEnd = Math.min(pageStart + EBOOKS_PER_PAGE, filteredEbooks.length);

  useEffect(() => { setPage(1); }, [activeCategory, query]);
  useEffect(() => { setPage((p) => Math.min(p, totalPages)); }, [totalPages]);

  /* ── hero auto-advance ── */
  const startHeroTimer = useCallback(() => {
    clearInterval(heroIntervalRef.current);
    heroIntervalRef.current = setInterval(() => {
      setHeroSlide((s) => (s + 1) % HERO_SLIDES.length);
    }, 5000);
  }, []);

  useEffect(() => {
    startHeroTimer();
    return () => clearInterval(heroIntervalRef.current);
  }, [startHeroTimer]);

  const goToSlide = (index: number) => {
    setHeroSlide(index);
    startHeroTimer();
  };

  /* ── featured carousel scroll tracking ── */
  const syncCarouselState = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    setCarouselPage(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    syncCarouselState();
    el.addEventListener("scroll", syncCarouselState, { passive: true });
    return () => el.removeEventListener("scroll", syncCarouselState);
  }, [syncCarouselState, ebooks.length]);

  const scrollCarousel = (dir: "prev" | "next") => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "next" ? el.clientWidth : -el.clientWidth, behavior: "smooth" });
  };

  const goToCarouselPage = (p: number) => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollTo({ left: p * el.clientWidth, behavior: "smooth" });
  };

  const slide = HERO_SLIDES[heroSlide];
  const premiumCount = ebooks.filter((e) => e.isPremium).length;

  return (
    <main>
      {/* ════════════ HERO ════════════ */}
      <section className="relative flex min-h-[calc(100svh-65px)] items-center overflow-hidden bg-ink text-white">
        {/* Background gradients */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-ink via-[#101c28] to-[#0d3530]" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 70% 70% at 65% 45%, rgba(31,122,109,0.25) 0%, transparent 70%)" }}
        />
        {/* Subtle dot grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />

        {/* Floating book display — right 50% desktop only */}
        {ebooks.length >= 3 && (
          <div
            className="absolute inset-y-6 right-6 hidden w-[48%] lg:block"
            style={{
              zIndex: 1,
              maskImage: "linear-gradient(to right, transparent 0%, black 20%, black 100%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 20%, black 100%)",
            }}
          >
            {ebooks.slice(0, 5).map((ebook, i) => {
              const pos = BOOK_POSITIONS[i];
              if (!pos) return null;
              return (
                <div
                  key={ebook.id}
                  className="absolute overflow-hidden"
                  style={{
                    top: pos.top,
                    left: pos.left,
                    width: `${Math.round(138 * pos.scale)}px`,
                    zIndex: pos.z,
                    transform: `rotate(${pos.rotate})`,
                    borderRadius: 10,
                    boxShadow: "0 24px 60px rgba(0,0,0,0.65), 0 6px 16px rgba(0,0,0,0.35)",
                  }}
                >
                  <EbookCover ebook={ebook} compact />
                </div>
              );
            })}
          </div>
        )}

        {/* Fade books into text area — only fade the left 40% of the book zone */}
        <div
          className="pointer-events-none absolute inset-0 hidden lg:block"
          style={{
            zIndex: 2,
            background:
              "linear-gradient(90deg, rgba(17,28,40,0.92) 0%, rgba(17,28,40,0.74) 42%, rgba(17,28,40,0.28) 62%, rgba(13,53,48,0.02) 100%)",
          }}
        />

        {/* Content */}
        <div className="relative mx-auto w-full max-w-7xl px-6 py-16 sm:py-20 lg:py-0" style={{ zIndex: 3 }}>
          <div className="max-w-[610px]">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Sparkles size={14} />
              {slide.eyebrow}
            </div>

            {/* Animated title + subtitle — key triggers re-animation */}
            <div key={heroSlide} className="hero-slide-in mt-7">
              <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl lg:text-[4.65rem]">
                {slide.title}
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/65 sm:text-xl">
                {slide.subtitle}
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={slide.primary.href}>
                <Button
                  size="lg"
                  className="h-12 gap-2 bg-palm px-7 text-base font-semibold text-white hover:bg-palm/90"
                  style={{ boxShadow: "0 8px 32px rgba(31,122,109,0.45)" }}
                >
                  {slide.primary.label}
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href={slide.secondary.href}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 gap-2 border-white/25 bg-transparent px-7 text-base text-white hover:bg-white/10"
                >
                  {slide.secondary.label}
                </Button>
              </Link>
            </div>

            {/* Slide dots */}
            <div className="mt-12 flex items-center gap-2.5">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                  aria-current={i === heroSlide ? "true" : undefined}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === heroSlide
                      ? "w-8 h-2.5 bg-palm"
                      : "w-2.5 h-2.5 bg-white/25 hover:bg-white/50"
                  )}
                />
              ))}
              <span className="ml-2 text-xs font-medium tabular-nums text-white/35">
                {heroSlide + 1} / {HERO_SLIDES.length}
              </span>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1.5 text-white/30 lg:flex" style={{ zIndex: 3 }}>
          <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ════════════ STATS BAR ════════════ */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <StatPill icon={BookOpen} label="Total Ebooks" value={`${ebooks.length}+`} />
            <StatPill icon={Layers} label="Categories" value={`${Math.max(0, categories.length - 1)}`} />
            <StatPill icon={Crown} label="Premium Titles" value={`${premiumCount}+`} />
            <StatPill icon={GraduationCap} label="Happy Readers" value="10K+" />
          </div>
        </div>
      </section>

      {/* ════════════ FEATURED CAROUSEL ════════════ */}
      {ebooks.length > 0 && (
        <section className="overflow-hidden bg-paper py-16">
          <div className="mx-auto max-w-7xl px-6">
            {/* Section heading + arrows */}
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-palm">Featured Reads</p>
                <h2 className="mt-1.5 text-3xl font-extrabold text-foreground sm:text-4xl">
                  Popular Right Now
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={!canPrev}
                  onClick={() => scrollCarousel("prev")}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white shadow-sm transition-all duration-200",
                    canPrev
                      ? "hover:border-primary hover:bg-primary hover:text-white"
                      : "cursor-not-allowed opacity-35"
                  )}
                  aria-label="Previous"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  disabled={!canNext}
                  onClick={() => scrollCarousel("next")}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white shadow-sm transition-all duration-200",
                    canNext
                      ? "hover:border-primary hover:bg-primary hover:text-white"
                      : "cursor-not-allowed opacity-35"
                  )}
                  aria-label="Next"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Track — snap on every 4th item (page boundary) */}
            <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-scroll scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {ebooks.map((ebook) => (
                <div
                  key={ebook.id}
                  className="snap-start shrink-0 w-[calc(50%-12px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]"
                >
                  <FeaturedCard ebook={ebook} isSubscribed={isSubscribed} />
                </div>
              ))}
            </div>

            {/* Page dots */}
            {totalCarouselPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: totalCarouselPages }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToCarouselPage(i)}
                    aria-label={`Page ${i + 1}`}
                    aria-current={i === carouselPage ? "true" : undefined}
                    className={cn(
                      "rounded-full transition-all duration-300",
                      i === carouselPage
                        ? "w-7 h-2.5 bg-primary"
                        : "w-2.5 h-2.5 bg-border hover:bg-muted-foreground"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ════════════ FULL CATALOG ════════════ */}
      <section id="catalog" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-palm">Full Catalog</p>
              <h2 className="mt-1.5 text-3xl font-extrabold text-foreground sm:text-4xl">
                Browse All Ebooks
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Showing {visibleStart}–{visibleEnd} of {filteredEbooks.length} titles
            </p>
          </div>

          {/* Search + filter bar */}
          <div className="mb-6 rounded-2xl border bg-paper p-4 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[minmax(18rem,0.85fr)_1fr] lg:items-start">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={20}
                />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, author, or topic…"
                  className="h-12 bg-white pl-12 text-base shadow-none"
                />
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setActiveCategory(item)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition",
                      activeCategory === item
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-white text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedEbooks.map((ebook) => (
              <EbookCard key={ebook.id} ebook={ebook} isSubscribed={isSubscribed} />
            ))}
          </div>

          {filteredEbooks.length === 0 && (
            <Card className="mt-10 p-10 text-center">
              <BookText className="mx-auto text-muted-foreground" size={44} />
              <p className="mt-3 text-xl font-semibold">No ebooks found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different keyword or category.
              </p>
            </Card>
          )}

          {filteredEbooks.length > EBOOKS_PER_PAGE && (
            <PaginationControls
              page={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </section>

      {/* ════════════ PREMIUM CTA ════════════ */}
      {!isSubscribed && (
        <section
          className="py-24 text-white"
          style={{ background: "linear-gradient(135deg, #0f4d44 0%, #1f7a6d 50%, #0d4539 100%)" }}
        >
          {/* Subtle grid background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          />
          <div className="relative mx-auto max-w-3xl px-6 text-center">
            <div className="mx-auto mb-7 grid h-18 w-18 place-items-center rounded-3xl bg-white/15 backdrop-blur-sm"
                 style={{ width: "4.5rem", height: "4.5rem" }}>
              <Crown size={32} />
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Unlock the Full Library
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70">
              Get unlimited access to all premium ebooks. Join thousands of learners advancing
              their knowledge with BookBridge.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link href="/subscribe">
                <Button
                  size="lg"
                  className="h-12 gap-2 bg-white px-8 font-bold text-palm shadow-xl hover:bg-white/90"
                >
                  <Crown size={18} />
                  View Subscription Plans
                </Button>
              </Link>
              <Link href="#catalog">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 border-white/30 bg-transparent px-8 text-white hover:bg-white/10"
                >
                  Browse Free Books
                </Button>
              </Link>
            </div>

            <div className="mt-11 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-white/60">
              {["Cancel anytime", "Instant access", "All premium titles", "New books monthly"].map(
                (f) => (
                  <span key={f} className="flex items-center gap-2">
                    <BadgeCheck size={16} className="text-sun" />
                    {f}
                  </span>
                )
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon size={22} />
      </span>
      <div>
        <p className="text-2xl font-extrabold leading-none text-foreground">{value}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function FeaturedCard({ ebook, isSubscribed }: { ebook: Ebook; isSubscribed: boolean }) {
  const locked = ebook.isPremium && !isSubscribed;
  const href = locked
    ? "/subscribe"
    : ebook.fileUrl
    ? `/ebooks/${ebook.slug}/read`
    : `/ebooks/${ebook.slug}`;

  return (
    <Link href={href} className="group block">
      <div className="overflow-hidden rounded-2xl shadow-soft transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
        {/* Cover image */}
        <EbookCover ebook={ebook} />

      </div>
      <div className="mt-3 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{ebook.category}</Badge>
          {ebook.isPremium ? (
            <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-800">
              <Crown size={12} />
              Premium
            </Badge>
          ) : null}
        </div>
        <p className="mt-2 truncate text-sm font-semibold text-foreground">{ebook.title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">by {ebook.author}</p>
        <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
          {locked ? (
            <>
              <LockKeyhole size={12} />
              Subscribe to read
            </>
          ) : (
            <>
              <BookOpen size={12} />
              Read now
            </>
          )}
        </span>
      </div>
    </Link>
  );
}

function EbookCard({ ebook, isSubscribed }: { ebook: Ebook; isSubscribed: boolean }) {
  const locked = ebook.isPremium && !isSubscribed;

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-soft">
      <CardHeader className="p-3 pb-0">
        <EbookCover ebook={ebook} />
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-5 pt-4">
        <div className="mb-4 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{ebook.category}</Badge>
            {ebook.isPremium ? (
              <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-800">
                <Crown size={12} />
                Premium
              </Badge>
            ) : null}
          </div>
          <h2 className="mt-3 text-xl font-semibold leading-snug text-foreground">
            {ebook.title}
          </h2>
          <p className="mt-1 text-sm font-medium text-muted-foreground">by {ebook.author}</p>
        </div>

        <p className="flex-1 text-sm leading-6 text-muted-foreground line-clamp-3">
          {ebook.description}
        </p>

        <div className="mt-4 flex gap-2 border-t border-border pt-4 text-xs">
          <span className="rounded-full bg-muted px-3 py-1.5 font-medium text-muted-foreground">
            {ebook.pages} pages
          </span>
          <span className="rounded-full bg-muted px-3 py-1.5 font-medium text-muted-foreground">
            {ebook.publishedYear}
          </span>
        </div>

        {locked ? (
          <Link href="/subscribe" className="mt-4">
            <Button variant="secondary" className="w-full rounded-full">
              <LockKeyhole size={16} />
              Upgrade to read
            </Button>
          </Link>
        ) : ebook.fileUrl ? (
          <Link href={`/ebooks/${ebook.slug}/read`} className="mt-4">
            <Button className="w-full rounded-full">
              <BookMarked size={16} />
              Open reader
              <ArrowRight
                className="transition group-hover:translate-x-0.5"
                size={16}
              />
            </Button>
          </Link>
        ) : (
          <Link href={`/ebooks/${ebook.slug}`} className="mt-4">
            <Button className="w-full rounded-full">
              <BookMarked size={16} />
              View details
              <ArrowRight
                className="transition group-hover:translate-x-0.5"
                size={16}
              />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={page === 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
          Previous
        </Button>

        {pageNumbers.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onPageChange(num)}
            aria-current={page === num ? "page" : undefined}
            className={cn(
              "grid h-9 min-w-9 place-items-center rounded-full border px-3 text-sm font-medium transition",
              page === num
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {num}
          </button>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={page === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          aria-label="Next page"
        >
          Next
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
