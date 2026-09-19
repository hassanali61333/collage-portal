import { NextResponse } from "next/server";

export default function middleware(request) {
  const url = new URL(request.url);
  const role = request.cookies.get("role")?.value;
  const path = url.pathname;

  // Login hi nahi hai
  if (!role) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const isAdminRoute = path.startsWith("/admin");
  const isUserRoute =
    path.startsWith("/userAdmission") ||
    path.startsWith("/userProfile") ||
    path.startsWith("/userDashboard");

  // Admin route pe non-admin ka access block
  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/userDashboard", request.url));
  }

  // User route pe admin ka access block (agar chahiye)
  if (isUserRoute && role !== "user") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/userDashboard/:path*",
    "/userProfile/:path*",
    "/userAdmission/:path*",
    "/admin/:path*",
  ],
};