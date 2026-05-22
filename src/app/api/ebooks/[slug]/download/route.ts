import { readFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getEbookBySlug } from "@/lib/ebooks";

const SUBSCRIPTION_COOKIE = "bookbridge_demo_subscription";

function getPdfFileName(slug: string) {
  return `${slug.replace(/[^a-z0-9-]/gi, "-") || "ebook"}.pdf`;
}

function getDownloadHeaders(fileName: string, contentType = "application/pdf") {
  return {
    "Content-Disposition": `attachment; filename="${fileName}"`,
    "Content-Type": contentType
  };
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const subscription = (await cookies()).get(SUBSCRIPTION_COOKIE)?.value;

  if (subscription !== "active") {
    return NextResponse.json({ error: "Premium membership required" }, { status: 403 });
  }

  const { slug } = await params;
  const ebook = await getEbookBySlug(slug);

  if (!ebook?.fileUrl) {
    return NextResponse.json({ error: "PDF not found" }, { status: 404 });
  }

  const fileName = getPdfFileName(ebook.slug);

  if (/^https?:\/\//i.test(ebook.fileUrl)) {
    const response = await fetch(ebook.fileUrl);

    if (!response.ok || !response.body) {
      return NextResponse.json({ error: "PDF not available" }, { status: 502 });
    }

    return new Response(response.body, {
      headers: getDownloadHeaders(fileName, response.headers.get("content-type") ?? undefined)
    });
  }

  const publicDir = path.resolve(process.cwd(), "public");
  const localPath = path.resolve(publicDir, ebook.fileUrl.replace(/^\/+/, ""));

  if (!localPath.startsWith(`${publicDir}${path.sep}`)) {
    return NextResponse.json({ error: "PDF path is invalid" }, { status: 400 });
  }

  try {
    const file = await readFile(localPath);

    return new Response(file, {
      headers: getDownloadHeaders(fileName)
    });
  } catch {
    return NextResponse.json({ error: "PDF not available" }, { status: 404 });
  }
}
