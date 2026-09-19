"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/authSlice.js";

const NAV_ITEMS = [
  {
    key: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    ),
  },
  {
    key: "/admin/form",
    label: "Form",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
  },
  {
    key: "/admin/seats",
    label: "Seat Configuration",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    ),
  },
  {
    key: "/admin/sendNotificaiton",
    label: "Send Notification",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
      />
    ),
  },
  {
    key: "/admin/allNotification",
    label: "All Notifications",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    ),
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth.user);

  const [open, setOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleNavigation = (path) => {
    router.push(path);
    setOpen(false);
  };

  const handleLogout = () => {
    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    dispatch(logoutUser());
    localStorage.removeItem("user");
    router.push("/");
    router.refresh();
  };

  return (
    <>
      {/* ---------- MOBILE TOP BAR ---------- */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-[#0a0e0d] px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-xs font-bold text-white ring-2 ring-white/20">
            AMC
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">
              AMC College
            </div>
            <div className="text-[10px] tracking-wider text-emerald-300/80 uppercase">
              Admin Panel
            </div>
          </div>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-lg text-neutral-300 hover:bg-white/10 hover:text-white transition-all duration-200 active:scale-90"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* ---------- BACKDROP (mobile only) ---------- */}
      <div
        onClick={() => setOpen(false)}
        className={
          "md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 " +
          (open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none")
        }
      ></div>

      {/* ---------- SIDEBAR ---------- */}
      <aside
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        className={
          // base
          "fixed md:sticky top-0 left-0 z-50 flex h-screen w-[260px] flex-col border-r-4 border-neutral-500 bg-[#0a0e0d] px-4 pb-4 pt-6 text-neutral-200 overflow-y-auto " +
          // hide scrollbar (chrome/safari/edge)
          "[&::-webkit-scrollbar]:hidden " +
          // animation
          "transition-transform duration-300 ease-in-out " +
          // mobile state
          (open ? "translate-x-0" : "-translate-x-full") +
          // desktop state (always visible)
          " md:translate-x-0 md:w-[232px]"
        }
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>

        {/* Close button (mobile only) */}
        <button
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="md:hidden absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:bg-white/10 hover:text-white transition-all duration-200 active:scale-90 z-10"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* College Header */}
        <div className="relative mb-6 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[rgb(57,83,61)] to-[rgb(38,58,41)] py-3 px-3 shadow-lg border border-white/10 hover:shadow-xl transition-all duration-300 group">
          <div className="relative flex h-11 w-11 flex-none items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-sm font-bold text-white ring-2 ring-white/30 shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            AMC
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0a0e0d] animate-pulse"></span>
          </div>

          <div>
            <div className="text-base font-bold leading-tight text-neutral-50">
              AMC College
            </div>
            <div className="mt-0.5 text-xs tracking-wider text-emerald-300/80 uppercase">
              Admin Panel
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.key;

            return (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.key)}
                className={
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 overflow-hidden " +
                  (active
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-lg shadow-blue-500/30 scale-[1.02]"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white hover:translate-x-1")
                }
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-white rounded-r-full"></span>
                )}

                <svg
                  className={
                    "w-4 h-4 flex-shrink-0 transition-transform duration-200 " +
                    (active
                      ? "text-white"
                      : "text-neutral-500 group-hover:text-blue-400 group-hover:scale-110")
                  }
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {item.icon}
                </svg>

                <span className="relative z-10">{item.label}</span>

                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Area */}
        <div className="relative mt-auto border-t border-white/10 pt-4">
          <div className="mb-4 rounded-xl bg-white/5 backdrop-blur-sm p-3 border border-white/10 hover:border-white/20 transition-all duration-200">
            <div className="flex items-center gap-2 mb-1.5">
              <svg
                className="w-3.5 h-3.5 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-xs font-semibold text-neutral-300">
                Admissions Office
              </span>
            </div>
            <div className="space-y-1 text-[11px] text-neutral-400">
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-3 h-3 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Mon–Fri · 08:30–15:30
              </div>
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-3 h-3 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="truncate">admissions@amc.edu.pk</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="group relative w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition-all duration-200 hover:from-red-700 hover:to-rose-700 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02] active:scale-95 overflow-hidden flex items-center justify-center gap-2"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="relative z-10">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}