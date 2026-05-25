import { getAdminSessionFromCookieHeader } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function jsonResponse(payload: unknown, status = 200) {
  return NextResponse.json(payload, { status, headers: { "Cache-Control": "no-store" } });
}

/* GET /api/admin/ebooks/pending — list all ebooks awaiting review */
export async function GET(request: Request) {
  const admin = await getAdminSessionFromCookieHeader(request.headers.get("cookie"));
  if (!admin) return jsonResponse({ error: "Admin login required." }, 401);

  const ebooks = await prisma.ebook.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      author: true,
      category: true,
      description: true,
      pages: true,
      publishedYear: true,
      coverImageUrl: true,
      fileUrl: true,
      uploadedByEmail: true,
      createdAt: true,
    },
  });

  return jsonResponse(ebooks);
}
