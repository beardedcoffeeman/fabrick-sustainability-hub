import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isDirector = req.nextUrl.pathname.startsWith("/director");
  const isLogin = req.nextUrl.pathname.startsWith("/director/login");
  const isAuthApi = req.nextUrl.pathname.startsWith("/api/auth");

  if (!isDirector) return NextResponse.next();
  if (isLogin || isAuthApi) return NextResponse.next();

  if (!req.auth) {
    const url = req.nextUrl.clone();
    url.pathname = "/director/login";
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/director/:path*", "/api/director/:path*"],
};
