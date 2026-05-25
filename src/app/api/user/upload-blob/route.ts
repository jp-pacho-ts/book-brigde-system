import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SUBSCRIPTION_COOKIE = "bookbridge_demo_subscription";
const USER_EMAIL_COOKIE = "bookbridge_user_email";

function jsonResponse(payload: Record<string, unknown>, status = 200) {
  return NextResponse.json(payload, { status, headers: { "Cache-Control": "no-store" } });
}

async function getSubscribedUserEmail(): Promise<string | null> {
  const jar = await cookies();
  const subscription = jar.get(SUBSCRIPTION_COOKIE)?.value;
  if (subscription !== "active") return null;
  const raw = jar.get(USER_EMAIL_COOKIE)?.value;
  return raw ? decodeURIComponent(raw) : null;
}

export async function GET() {
  const email = await getSubscribedUserEmail();
  if (!email) {
    return jsonResponse({ error: "Premium membership required to upload." }, 403);
  }
  return jsonResponse({ ready: true, email });
}

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const email = await getSubscribedUserEmail();
        if (!email) throw new Error("Premium membership required to upload.");

        return {
          allowedContentTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
          addRandomSuffix: true,
          callbackUrl: new URL(request.url).toString(),
          tokenPayload: JSON.stringify({ uploaderEmail: email }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("User blob upload completed", blob.url);
      },
    });

    return jsonResponse(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return jsonResponse({ error: message }, 400);
  }
}
