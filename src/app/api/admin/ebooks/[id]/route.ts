import { getAdminSessionFromCookieHeader } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function jsonResponse(payload: unknown, status = 200) {
  return NextResponse.json(payload, { status, headers: { "Cache-Control": "no-store" } });
}

/* PATCH /api/admin/ebooks/[id] — approve or reject a pending ebook */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSessionFromCookieHeader(request.headers.get("cookie"));
  if (!admin) return jsonResponse({ error: "Admin login required." }, 401);

  const { id } = await params;
  const body = await request.json() as { action: "approve" | "reject" };

  if (body.action !== "approve" && body.action !== "reject") {
    return jsonResponse({ error: "action must be 'approve' or 'reject'." }, 400);
  }

  const ebook = await prisma.ebook.findUnique({ where: { id } });
  if (!ebook) return jsonResponse({ error: "Ebook not found." }, 404);

  const updated = await prisma.ebook.update({
    where: { id },
    data: { status: body.action === "approve" ? "PUBLISHED" : "REJECTED" },
  });

  return jsonResponse({ ok: true, status: updated.status });
}
