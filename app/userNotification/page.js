// app/userNotifications/page.js
"use client";
import { useState, useEffect, useCallback } from "react";

import { getAllNotifications } from "@/app/services/service.js";
import UserSidebar from "../components/userSidebar";

// ---------- react-icons ----------
import {
  FiBell,
  FiInbox,
  FiRefreshCw,
  FiClock,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllNotifications();
      const data = res?.data?.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      showToast("Failed to load notifications", "error");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(dateStr);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-neutral-50">
      <div className="w-full md:w-[210px] md:min-w-[210px] flex-shrink-0">
        <UserSidebar />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">

          {/* ---------- Header ---------- */}
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center flex-shrink-0">
                <FiBell className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-black tracking-tight">
                  Notifications
                </h1>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Stay updated with all announcements
                </p>
              </div>
            </div>
          </div>

          {/* ---------- Stats ---------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

            {/* Total — white card */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-neutral-400 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">
                    Total
                  </p>
                  <p className="text-3xl font-bold text-black mt-1 tracking-tight">
                    {notifications.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center">
                  <FiInbox className="w-6 h-6 text-black" />
                </div>
              </div>
            </div>

            {/* Latest — featured black card */}
            <div
              className="rounded-2xl p-5"
              style={{
                backgroundColor: "#000",
                marginLeft: "1px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              <p className="text-[10px] font-semibold text-white/60 uppercase tracking-wide">
                Latest
              </p>
              <p className="text-sm font-semibold text-white mt-1 truncate">
                {notifications[0]?.title || "—"}
              </p>
            </div>
          </div>

          {/* ---------- List Header ---------- */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-7 bg-black rounded-full" />
              <h2 className="text-lg md:text-xl font-bold text-black tracking-tight">
                All Notifications
              </h2>
              <span className="text-[11px] font-bold text-white bg-black px-2.5 py-1 rounded-full">
                {notifications.length}
              </span>
            </div>

            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="p-2.5 border border-neutral-200 bg-white rounded-lg hover:bg-black hover:text-white hover:border-black transition-all disabled:opacity-50 group"
              title="Refresh"
            >
              <FiRefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>

          {/* ---------- Notifications List ---------- */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white border border-neutral-200 rounded-2xl">
              <div className="relative">
                <div className="w-10 h-10 rounded-full border-2 border-neutral-200" />
                <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-black animate-spin" />
              </div>
              <p className="mt-4 text-xs text-neutral-500 font-medium">
                Loading notifications
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 bg-white border-2 border-dashed border-neutral-200 rounded-2xl">
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mx-auto mb-5">
                <FiInbox className="w-7 h-7 text-white" />
              </div>
              <p className="text-black font-bold text-base tracking-tight">
                No notifications yet
              </p>
              <p className="text-neutral-500 text-sm mt-1">
                Check back later for new announcements
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n, index) => (
                <div
                  key={n._id || index}
                  className="group relative bg-white border border-neutral-200 rounded-2xl p-4 md:p-5 hover:border-neutral-400 transition-colors duration-200"
                >
                  {/* Left accent bar on hover */}
                  <div className="absolute left-0 top-4 bottom-4 w-1 bg-black rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="flex items-start gap-3 md:gap-4">
                    {/* Index badge */}
                    <div className="flex-shrink-0 w-11 h-11 bg-black rounded-xl flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {index + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <h3 className="text-base md:text-lg font-bold text-black break-words tracking-tight">
                          {n.title}
                        </h3>
                        <span className="text-[11px] font-semibold text-black bg-neutral-100 px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                          {mounted ? timeAgo(n.createdAt) : ""}
                        </span>
                      </div>

                      <p className="text-sm text-neutral-600 mt-2 whitespace-pre-wrap break-words leading-relaxed">
                        {n.message}
                      </p>

                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-neutral-100">
                        <span className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
                          <FiClock className="w-3.5 h-3.5" />
                          {mounted ? formatDate(n.createdAt) : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10 pt-6 border-t border-neutral-100">
            <p className="text-xs text-neutral-400 font-medium">
              © 2026 AMC College · Notification Management
            </p>
          </div>
        </div>
      </div>

      {/* ---------- Toast ---------- */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl border font-semibold text-sm ${
            toast.type === "error"
              ? "bg-white border-neutral-300 text-black shadow-lg"
              : "bg-black border-black text-white shadow-lg"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "error" ? (
              <FiAlertCircle className="w-4 h-4" />
            ) : (
              <FiCheck className="w-4 h-4" />
            )}
            {toast.text}
          </div>
        </div>
      )}
    </div>
  );
}