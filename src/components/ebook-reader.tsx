"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Crown,
  FileText,
  Library,
  Loader2,
  LockKeyhole,
  Minus,
  Plus
} from "lucide-react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import type { Ebook } from "@/lib/ebooks";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const pdfWorkerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.js", import.meta.url).toString();
const MIN_SCALE = 0.7;
const MAX_SCALE = 1.8;
const SCALE_STEP = 0.15;
type PdfLoadingTask = {
  promise: Promise<PDFDocumentProxy>;
  destroy: () => Promise<void>;
};

export function EbookReader({ ebook }: { ebook: Ebook }) {
  const { isReady, isSubscribed } = useAuth();
  const isLocked = ebook.isPremium && !isSubscribed;

  if (ebook.isPremium && !isReady) {
    return (
      <ReaderShell ebook={ebook}>
        <ReaderState
          icon={<Loader2 className="animate-spin" size={28} aria-hidden="true" />}
          title="Checking access"
          description="Preparing the reader for this premium ebook."
        />
      </ReaderShell>
    );
  }

  if (isLocked) {
    return (
      <ReaderShell ebook={ebook}>
        <ReaderState
          icon={<LockKeyhole size={28} aria-hidden="true" />}
          title="Premium access required"
          description="Upgrade your account to open this ebook in the BookBridge reader."
          action={
            <Link href="/subscribe">
              <Button>
                <Crown size={16} aria-hidden="true" />
                Upgrade to read
              </Button>
            </Link>
          }
        />
      </ReaderShell>
    );
  }

  if (!ebook.fileUrl) {
    return (
      <ReaderShell ebook={ebook}>
        <ReaderState
          icon={<FileText size={28} aria-hidden="true" />}
          title="PDF not attached"
          description="This ebook has catalog details, but the PDF file has not been uploaded yet."
        />
      </ReaderShell>
    );
  }

  return (
    <ReaderShell ebook={ebook}>
      <PdfCanvasReader ebook={ebook} fileUrl={ebook.fileUrl} />
    </ReaderShell>
  );
}

function PdfCanvasReader({ ebook, fileUrl }: { ebook: Ebook; fileUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [scale, setScale] = useState(1);
  const [status, setStatus] = useState("Loading PDF...");
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;
    let loadingTask: PdfLoadingTask | null = null;

    setStatus("Loading PDF...");
    setError("");
    setPdf(null);
    setPageNumber(1);
    setPageInput("1");

    async function loadPdf() {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf");
      pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
      loadingTask = pdfjs.getDocument({
        url: fileUrl,
        disableAutoFetch: false,
        disableStream: false
      }) as PdfLoadingTask;

      try {
        const loadedPdf = await loadingTask.promise;

        if (isCancelled) {
          void loadedPdf.destroy();
          return;
        }

        setPdf(loadedPdf);
        setStatus("");
      } catch {
        if (!isCancelled) {
          setError("The PDF could not be loaded in the reader.");
          setStatus("");
        }
      }
    }

    void loadPdf();

    return () => {
      isCancelled = true;
      renderTaskRef.current?.cancel();
      void loadingTask?.destroy();
    };
  }, [fileUrl]);

  useEffect(() => {
    if (!pdf || !canvasRef.current) {
      return;
    }

    let isCancelled = false;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      setError("The reader canvas is not available.");
      return;
    }

    setStatus(`Rendering page ${pageNumber}...`);
    setError("");
    renderTaskRef.current?.cancel();

    pdf
      .getPage(pageNumber)
      .then((page) => {
        if (isCancelled) {
          return;
        }

        const baseViewport = page.getViewport({ scale: 1 });
        const containerWidth = Math.min(window.innerWidth - 48, 980);
        const fitScale = Math.max(0.5, containerWidth / baseViewport.width);
        const viewport = page.getViewport({ scale: fitScale * scale });
        const outputScale = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
        context.clearRect(0, 0, viewport.width, viewport.height);

        const renderTask = page.render({
          canvasContext: context,
          viewport
        });
        renderTaskRef.current = renderTask;

        return renderTask.promise;
      })
      .then(() => {
        if (!isCancelled) {
          setStatus("");
        }
      })
      .catch((renderError) => {
        if (!isCancelled && renderError instanceof Error && renderError.name !== "RenderingCancelledException") {
          setError("This page could not be rendered.");
          setStatus("");
        }
      });

    return () => {
      isCancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [pageNumber, pdf, scale]);

  function goToPage(nextPage: number) {
    if (!pdf) {
      return;
    }

    const clampedPage = Math.min(Math.max(nextPage, 1), pdf.numPages);
    setPageNumber(clampedPage);
    setPageInput(clampedPage.toString());
  }

  function submitPageInput() {
    const nextPage = Number.parseInt(pageInput, 10);

    if (Number.isFinite(nextPage)) {
      goToPage(nextPage);
      return;
    }

    setPageInput(pageNumber.toString());
  }

  function changeScale(nextScale: number) {
    setScale(Math.min(Math.max(nextScale, MIN_SCALE), MAX_SCALE));
  }

  return (
    <section
      className="flex flex-1 flex-col bg-muted/60"
      onContextMenu={(event) => event.preventDefault()}
      onCopy={(event) => event.preventDefault()}
      onCut={(event) => event.preventDefault()}
      onPaste={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
    >
      <div className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <ReaderIconButton
              label="Previous page"
              disabled={!pdf || pageNumber <= 1}
              onClick={() => goToPage(pageNumber - 1)}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </ReaderIconButton>

            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                submitPageInput();
              }}
            >
              <Input
                aria-label="Page number"
                className="h-9 w-20 text-center"
                inputMode="numeric"
                value={pageInput}
                disabled={!pdf}
                onChange={(event) => setPageInput(event.target.value)}
                onBlur={submitPageInput}
              />
              <span className="whitespace-nowrap text-sm font-medium text-muted-foreground">
                / {pdf?.numPages ?? "..."}
              </span>
            </form>

            <ReaderIconButton
              label="Next page"
              disabled={!pdf || pageNumber >= pdf.numPages}
              onClick={() => goToPage(pageNumber + 1)}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </ReaderIconButton>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ReaderIconButton
              label="Zoom out"
              disabled={scale <= MIN_SCALE}
              onClick={() => changeScale(scale - SCALE_STEP)}
            >
              <Minus size={18} aria-hidden="true" />
            </ReaderIconButton>
            <span className="min-w-16 text-center text-sm font-semibold text-foreground">
              {Math.round(scale * 100)}%
            </span>
            <ReaderIconButton
              label="Zoom in"
              disabled={scale >= MAX_SCALE}
              onClick={() => changeScale(scale + SCALE_STEP)}
            >
              <Plus size={18} aria-hidden="true" />
            </ReaderIconButton>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-5 lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="rounded-lg border bg-background p-4 shadow-sm">
          <Badge variant="secondary" className="gap-2">
            <Library size={13} aria-hidden="true" />
            {ebook.category}
          </Badge>
          <h2 className="mt-4 text-lg font-semibold leading-snug text-foreground">{ebook.title}</h2>
          <p className="mt-2 text-sm font-medium text-muted-foreground">by {ebook.author}</p>
          <dl className="mt-5 space-y-3 text-sm">
            <ReaderMeta label="Pages" value={ebook.pages.toString()} />
            <ReaderMeta label="Published" value={ebook.publishedYear.toString()} />
            <ReaderMeta label="Access" value={ebook.isPremium ? "Premium" : "Free"} />
          </dl>
        </aside>

        <div className="min-w-0 rounded-lg border bg-background p-3 shadow-sm md:p-5">
          <div className="relative min-h-[70vh] overflow-auto rounded-md bg-muted p-3 md:p-6">
            {status ? (
              <p className="mb-3 rounded-md bg-background px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm">
                {status}
              </p>
            ) : null}
            {error ? (
              <p className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {error}
              </p>
            ) : null}
            <div className="flex min-w-max justify-center">
              <canvas
                ref={canvasRef}
                aria-label={`${ebook.title} page ${pageNumber}`}
                className={cn(
                  "select-none rounded-sm bg-white shadow-xl",
                  !pdf || error ? "hidden" : "block"
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReaderShell({ ebook, children }: { ebook: Ebook; children: React.ReactNode }) {
  return (
    <main className="surface-line flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:min-h-16 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={`/ebooks/${ebook.slug}`}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-md border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
              title="Back to ebook details"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </Link>

            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <BookOpen size={18} aria-hidden="true" />
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-semibold text-foreground">{ebook.title}</h1>
                {ebook.isPremium ? (
                  <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-800">
                    <Crown size={13} aria-hidden="true" />
                    Premium
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    Free
                  </Badge>
                )}
              </div>
              <p className="mt-1 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                <Library size={13} aria-hidden="true" />
                <span className="truncate">{ebook.category}</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {children}
    </main>
  );
}

function ReaderIconButton({
  label,
  disabled,
  onClick,
  children
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function ReaderMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted px-3 py-2">
      <dt className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function ReaderState({
  icon,
  title,
  description,
  action
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="grid flex-1 place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 text-center text-foreground shadow-soft">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <h2 className="mt-5 text-2xl font-semibold">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </section>
  );
}
