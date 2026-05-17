import { NextResponse, type NextRequest } from "next/server";

const localPdfPathPattern = /^\/(?:uploads|bookbridge)\/ebooks\/([^/]+)\.pdf$/;

export function middleware(request: NextRequest) {
  const match = request.nextUrl.pathname.match(localPdfPathPattern);

  if (!match) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/ebooks/${match[1]}/read`;
  url.search = "";

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/uploads/ebooks/:path*", "/bookbridge/ebooks/:path*"]
};
