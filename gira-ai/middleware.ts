import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/calendar/:path*",
    "/marketing/:path*",
    "/pricing/:path*",
    "/pro/:path*",
  ],
};