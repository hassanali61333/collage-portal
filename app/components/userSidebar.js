"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/authSlice.js";

const NAV_ITEMS = [
  {
    key: "/userDashboard",
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
    key: "/userForm",
    label: "Update Info",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    ),
  },
  {
    key: "/userProfile",
    label: "Profile",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    ),
  },
  {
    key: "/userNotification",
    label: "Notification",
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

export default function UserSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth.user);

  const [isOpen, setIsOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open (mobile)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleNavigation = (path) => {
    router.push(path);
    setIsOpen(false);
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
      {/* ───────── Mobile Top Bar with Hamburger ───────── */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-4 py-3 shadow-lg shadow-indigo-900/20">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg blur-md opacity-60" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-xs font-bold text-white shadow-lg shadow-indigo-500/40">
              AMC
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">
              AMC College
            </div>
            <div className="text-[10px] text-indigo-300/70">
              Sector G-6/3, Islamabad
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-lg bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* ───────── Backdrop (mobile) ───────── */}
      <div
        onClick={() => setIsOpen(false)}
        className={
          "md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 " +
          (isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")
        }
      />

      {/* ───────── Sidebar (drawer on mobile, static on desktop) ───────── */}
      <aside
        className={
          "fixed md:sticky top-0 left-0 z-50 md:z-auto h-screen w-[260px] md:w-[240px] md:min-w-[240px] flex flex-col bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-slate-200 shadow-2xl shadow-indigo-900/20 overflow-hidden transition-transform duration-300 ease-out " +
          (isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")
        }
      >
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative flex flex-col h-full px-4 pb-4 pt-6">
          {/* Header + Close (mobile) */}
          <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl blur-md opacity-60" />
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/40">
                  AMC
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-base font-bold leading-tight text-white truncate">
                  AMC College
                </div>
                <div className="mt-0.5 text-xs tracking-wide text-indigo-300/70 truncate">
                  Sector G-6/3, Islamabad
                </div>
              </div>
            </div>

            {/* Close button (mobile only) */}
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              className="md:hidden p-2 rounded-lg bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all active:scale-95 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => handleNavigation(item.key)}
                  className={
                    "group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition-all duration-200 " +
                    (active
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30"
                      : "text-slate-300 hover:bg-white/5 hover:text-white")
                  }
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                  )}

                  <span
                    className={
                      "flex-shrink-0 w-5 h-5 transition-transform duration-200 " +
                      (active ? "scale-110" : "group-hover:scale-110")
                    }
                  >
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {item.icon}
                    </svg>
                  </span>

                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom Area */}
          <div className="mt-auto border-t border-white/10 pt-4">
            <div className="mb-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500/40 to-purple-500/40 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-white">Admissions Office</p>
              </div>
              <div className="space-y-1 text-[11px] text-slate-400 leading-relaxed">
                <p className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-indigo-400" />
                  Mon–Fri · 08:30–15:30
                </p>
                <p className="flex items-center gap-1.5 truncate">
                  <span className="w-1 h-1 rounded-full bg-purple-400" />
                  admissions@amc.edu.pk
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="group w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-3 text-sm font-bold text-white transition-all duration-200 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 active:scale-[0.98]"
            >
              <svg
                className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
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
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}