// app/userNotifications/page.js
"use client";
import { useState, useEffect, useCallback } from "react";

import { getAllNotifications } from "@/app/services/service.js";
import UserSidebar from "../components/userSidebar";

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
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="w-full md:w-[210px] md:min-w-[210px] flex-shrink-0">
        <UserSidebar />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-40" />
                <div className="relative w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Notifications
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Stay updated with all announcements
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="group bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{notifications.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="group relative bg-gradient-to-tr from-slate-900 to-slate-800 rounded-2xl p-5 overflow-hidden shadow-lg shadow-slate-900/20">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Latest</p>
                <p className="text-sm font-semibold text-white mt-1 truncate">
                  {notifications[0]?.title || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* List Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-7 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
              <h2 className="text-lg md:text-xl font-bold text-slate-900">All Notifications</h2>
              <span className="text-xs font-bold text-white bg-gradient-to-tr from-indigo-500 to-purple-500 px-2.5 py-1 rounded-full shadow-sm shadow-indigo-500/30">
                {notifications.length}
              </span>
            </div>
            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="p-2.5 border border-slate-200 bg-white rounded-xl hover:bg-gradient-to-tr hover:from-indigo-600 hover:to-purple-600 hover:text-white hover:border-transparent transition-all disabled:opacity-50 group shadow-sm hover:shadow-md hover:shadow-indigo-500/30"
              title="Refresh"
            >
              <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl">
              <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="mt-3 text-sm text-slate-500 font-medium">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 bg-white/70 backdrop-blur-sm border-2 border-dashed border-slate-200 rounded-2xl">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-slate-900 font-bold text-base">No notifications yet</p>
              <p className="text-slate-500 text-sm mt-1">Check back later for new announcements</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n, index) => (
                <div
                  key={n._id || index}
                  className="group relative bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 md:p-5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <h3 className="text-base md:text-lg font-bold text-slate-900 break-words">
                          {n.title}
                        </h3>
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                          {mounted ? timeAgo(n.createdAt) : ""}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap break-words leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {mounted ? formatDate(n.createdAt) : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-medium">
              © 2026 AMC College · Notification Management
            </p>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl border font-semibold text-sm backdrop-blur-md ${
            toast.type === "error"
              ? "bg-white/95 border-red-200 text-red-600 shadow-xl shadow-red-500/20"
              : "bg-gradient-to-tr from-indigo-600 to-purple-600 border-transparent text-white shadow-xl shadow-indigo-500/40"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "error" ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.text}
          </div>
        </div>
      )}
    </div>
  );
}