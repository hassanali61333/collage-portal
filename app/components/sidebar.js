"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/authSlice.js";

// ---------- react-icons ----------
import {
  HiOutlineHome,
  HiOutlineViewGrid,
  HiOutlinePaperAirplane,
  HiOutlineBell,
  HiOutlineCalendar,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineMail,
  HiOutlineLogout,
} from "react-icons/hi";

const NAV_ITEMS = [
  {
    key: "/admin/dashboard",
    label: "Dashboard",
    icon: <HiOutlineHome className="w-4 h-4" />,
  },
  {
    key: "/admin/seats",
    label: "Seat Configuration",
    icon: <HiOutlineViewGrid className="w-4 h-4" />,
  },
  {
    key: "/admin/sendNotificaiton",
    label: "Send Notification",
    icon: <HiOutlinePaperAirplane className="w-4 h-4" />,
  },
  {
    key: "/admin/allNotification",
    label: "All Notifications",
    icon: <HiOutlineBell className="w-4 h-4" />,
  },
  {
    key: "/admin/datesetting",
    label: "Date Info",
    icon: <HiOutlineCalendar className="w-4 h-4" />,
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
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-neutral-900 px-4 py-3 shadow-lg border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-xs font-bold text-neutral-900 shadow-lg">
            AMC
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">
              AMC College
            </div>
            <div className="text-[10px] tracking-wider text-orange-400 uppercase">
              Admin Panel
            </div>
          </div>
        </div>

        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-lg bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all active:scale-95"
        >
          <HiOutlineMenu className="w-5 h-5" />
        </button>
      </div>

      {/* ---------- BACKDROP (mobile only) ---------- */}
      <div
        onClick={() => setOpen(false)}
        className={
          "md:hidden fixed inset-0 z-40 bg-neutral-900/60 backdrop-blur-sm transition-opacity duration-300 " +
          (open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none")
        }
      />

      {/* ---------- SIDEBAR ---------- */}
      <aside
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        className={
          "fixed md:sticky top-0 left-0 z-50 md:z-auto flex h-screen w-[260px] md:w-[240px] md:min-w-[240px] flex-col bg-neutral-900 text-neutral-200 shadow-2xl overflow-y-auto " +
          "[&::-webkit-scrollbar]:hidden " +
          "transition-transform duration-300 ease-out " +
          (open ? "translate-x-0" : "-translate-x-full") +
          " md:translate-x-0"
        }
      >
        {/* Subtle radial accents (neutral) */}
        <div className="pointer-events-none absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle_at_70%_30%,white,transparent_70%)] opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-40 h-40 bg-[radial-gradient(circle_at_30%_70%,white,transparent_70%)] opacity-5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex flex-col h-full px-4 pb-4 pt-6">
          {/* Close button (mobile only) */}
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="md:hidden absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:bg-white/10 hover:text-white transition-all active:scale-90 z-10"
          >
            <HiOutlineX className="w-4 h-4" />
          </button>

          {/* College Header */}
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 py-3 px-3 group">
            <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-neutral-900 shadow-lg">
              AMC
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-orange-500 rounded-full border-2 border-neutral-900 animate-pulse" />
            </div>

            <div className="min-w-0">
              <div className="text-base font-bold leading-tight text-white truncate">
                AMC College
              </div>
              <div className="mt-0.5 text-[11px] tracking-wider text-orange-400 uppercase font-semibold">
                Admin Panel
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="relative flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => handleNavigation(item.key)}
                  className={
                    "group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition-all duration-200 " +
                    (active
                      ? "bg-white text-neutral-900 shadow-lg"
                      : "text-neutral-300 hover:bg-white/5 hover:text-white")
                  }
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-neutral-900 rounded-r-full" />
                  )}

                  <span
                    className={
                      "flex-shrink-0 w-5 h-5 transition-transform duration-200 " +
                      (active
                        ? "text-neutral-900 scale-110"
                        : "text-neutral-400 group-hover:text-orange-400 group-hover:scale-110")
                    }
                  >
                    {item.icon}
                  </span>

                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom Area */}
          <div className="mt-auto border-t border-white/10 pt-4">
            <div className="mb-4 rounded-xl bg-white/5 border border-white/10 p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-orange-500/15 flex items-center justify-center border border-orange-500/20">
                  <HiOutlineLocationMarker className="w-3.5 h-3.5 text-orange-400" />
                </div>
                <p className="text-xs font-semibold text-white">
                  Admissions Office
                </p>
              </div>
              <div className="space-y-1 text-[11px] text-neutral-400 leading-relaxed">
                <p className="flex items-center gap-1.5">
                  <HiOutlineClock className="w-3 h-3 text-neutral-400" />
                  Mon–Fri · 08:30–15:30
                </p>
                <p className="flex items-center gap-1.5 truncate">
                  <HiOutlineMail className="w-3 h-3 text-neutral-400" />
                  admissions@amc.edu.pk
                </p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="group w-full flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-bold text-neutral-900 transition-all duration-200 hover:bg-neutral-200 shadow-md active:scale-[0.98]"
            >
              <HiOutlineLogout className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}