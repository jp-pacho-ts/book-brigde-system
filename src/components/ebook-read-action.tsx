"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, LockKeyhole } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";

export function EbookReadAction({
  fileUrl,
  isPremium
}: {
  fileUrl: string | null;
  isPremium: boolean;
}) {
  const { isSubscribed } = useAuth();

  if (isPremium && !isSubscribed) {
    return (
      <Link href="/subscribe" className="inline-flex">
        <Button>
          <LockKeyhole size={16} aria-hidden="true" />
          Upgrade to read
        </Button>
      </Link>
    );
  }

  if (!fileUrl) {
    return (
      <Button type="button" disabled>
        <BookOpen size={16} aria-hidden="true" />
        PDF not attached
      </Button>
    );
  }

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
    >
      <BookOpen size={16} aria-hidden="true" />
      Open PDF
      <ArrowRight size={16} aria-hidden="true" />
    </a>
  );
}
