import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const admin = await getAdminSession();

        if (!admin) {
          throw new Error("Admin login required.");
        }

        return {
          allowedContentTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            adminId: admin.id
          })
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("BookBridge blob upload completed", blob.url);
      }
    });

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
