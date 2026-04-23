import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        // Rotas públicas
        const publicPaths = ["/login", "/api/auth", "/api/debug", "/video-editor", "/api/socialflow"];
        const isPublic = publicPaths.some((p) => req.nextUrl.pathname.startsWith(p));
        if (isPublic) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
