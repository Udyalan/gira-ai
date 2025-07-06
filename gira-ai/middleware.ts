export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/calendar/:path*",
    "/marketing/:path*",
    "/pricing/:path*",
    "/pro/:path*",
  ],
};