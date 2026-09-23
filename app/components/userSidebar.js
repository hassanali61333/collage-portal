"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/authSlice.js";

// ---------- react-icons ----------
import {
  HiOutlineHome,
  HiOutlinePencil,
  HiOutlineUser,
  HiOutlineBell,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineClock,
  HiOutlineLogout,
} from "react-icons/hi";

const NAV_ITEMS = [
  {
    key: "/userDashboard",
    label: "Dashboard",
    icon: <HiOutlineHome className="w-full h-full" />,
  },
  {
    key: "/userForm",
    label: "Update Info",
    icon: <HiOutlinePencil className="w-full h-full" />,
  },
  {
    key: "/userProfile",
    label: "Profile",
    icon: <HiOutlineUser className="w-full h-full" />,
  },
  {
    key: "/userNotification",
    label: "Notification",
    icon: <HiOutlineBell className="w-full h-full" />,
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
      {/* ───────── Mobile Top Bar ───────── */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-neutral-900 px-4 py-3 shadow-lg border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-xs font-bold text-neutral-900 shadow-lg">
              AMC
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">
              AMC College
            </div>
            <div className="text-[10px] text-neutral-400">
              Sector G-6/3, Islamabad
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-lg bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all active:scale-95"
        >
          <HiOutlineMenu className="w-5 h-5" />
        </button>
      </div>

      {/* ───────── Backdrop (mobile) ───────── */}
      <div
        onClick={() => setIsOpen(false)}
        className={
          "md:hidden fixed inset-0 z-40 bg-neutral-900/60 backdrop-blur-sm transition-opacity duration-300 " +
          (isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none")
        }
      />

      {/* ───────── Sidebar ───────── */}
      <aside
        className={
          "fixed md:sticky top-0 left-0 z-50 md:z-auto h-screen w-[260px] md:w-[240px] md:min-w-[240px] flex flex-col bg-neutral-900 text-neutral-200 shadow-2xl overflow-hidden transition-transform duration-300 ease-out " +
          (isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")
        }
      >
        {/* Subtle radial accents */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle_at_70%_30%,white,transparent_70%)] opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[radial-gradient(circle_at_30%_70%,white,transparent_70%)] opacity-5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative flex flex-col h-full px-4 pb-4 pt-6">
          {/* Header + Close (mobile) */}
          <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-bold text-neutral-900 shadow-lg">
                  AMC
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-base font-bold leading-tight text-white truncate">
                  AMC College
                </div>
                <div className="mt-0.5 text-xs tracking-wide text-neutral-400 truncate">
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
              <HiOutlineX className="w-4 h-4" />
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
                      (active ? "scale-110" : "group-hover:scale-110")
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
            <div className="mb-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                  <HiOutlineClock className="w-3.5 h-3.5 text-neutral-300" />
                </div>
                <p className="text-xs font-semibold text-white">
                  Admissions Office
                </p>
              </div>
              <div className="space-y-1 text-[11px] text-neutral-400 leading-relaxed">
                <p className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-neutral-300" />
                  Mon–Fri · 08:30–15:30
                </p>
                <p className="flex items-center gap-1.5 truncate">
                  <span className="w-1 h-1 rounded-full bg-neutral-300" />
                  admissions@amc.edu.pk
                </p>
              </div>
            </div>

            {/* Logout — white pill button */}
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