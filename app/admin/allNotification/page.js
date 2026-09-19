// app/userNotifications/page.js
"use client";
import { useState, useEffect, useCallback } from "react";
import { getAllNotifications, deleteNotification } from "@/app/services/service.js";
import Sidebar from "@/app/components/sidebar";

export default function AllNotification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllNotifications();
      const data = res?.data?.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ---------- DELETE HANDLER ----------
  const handleDelete = useCallback(async (id) => {
    if (!id) return;
    setDeletingId(id);
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setConfirmDelete(null);
    } catch (err) {
      console.error("Error deleting notification:", err);
      alert("Failed to delete notification. Please try again.");
    } finally {
      setDeletingId(null);
    }
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className="w-full md:w-[210px] md:min-w-[210px] flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
          {/* ---------- HERO HEADER ---------- */}
          <div className="relative bg-[rgb(19,18,18)] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl mb-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative p-6 md:p-8 lg:p-10 flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center ring-4 ring-white/20 shadow-2xl">
                  <svg
                    className="w-10 h-10 md:w-12 md:h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">
                  Notifications
                </h1>
                <p className="text-blue-200 text-sm md:text-base mb-3">
                  Stay updated with all announcements from AMC College
                </p>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white text-xs md:text-sm rounded-full border border-white/20">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    {notifications.length} Total
                  </span>
                  {mounted && notifications[0]?.createdAt && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white text-xs md:text-sm rounded-full border border-white/20">
                      <svg
                        className="w-3.5 h-3.5"
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
                      Updated {timeAgo(notifications[0].createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ---------- STAT CARDS ---------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-6">
            <StatCard
              label="Total Notifications"
              value={notifications.length}
              gradient="from-blue-500 to-indigo-600"
              icon="bell"
            />
            <StatCard
              label="Latest Title"
              value={notifications[0]?.title || "—"}
              gradient="from-emerald-500 to-teal-600"
              icon="star"
              isText
            />
            <StatCard
              label="Last Updated"
              value={
                mounted && notifications[0]?.createdAt
                  ? timeAgo(notifications[0].createdAt)
                  : "—"
              }
              gradient="from-purple-500 to-pink-600"
              icon="clock"
              isText
            />
          </div>

          {/* ---------- NOTIFICATIONS LIST CARD ---------- */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    All Notifications
                  </h2>
                  <p className="text-xs text-slate-500">
                    {notifications.length} total records
                  </p>
                </div>
              </div>

              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 transform hover:-translate-y-0.5"
              >
                <svg
                  className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>

            {/* Body */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-sm text-slate-500 font-medium animate-pulse">
                  Loading notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-20 px-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg
                    className="w-10 h-10 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  No notifications yet
                </h3>
                <p className="text-slate-500 text-sm">
                  Check back later for updates from the college
                </p>
              </div>
            ) : (
              <div className="p-4 md:p-6 space-y-4">
                {notifications.map((n, index) => (
                  <NotificationCard
                    key={n._id || index}
                    n={n}
                    index={index}
                    timeAgo={timeAgo}
                    formatDate={formatDate}
                    mounted={mounted}
                    onDelete={() => setConfirmDelete(n)}
                    isDeleting={deletingId === n._id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ---------- FOOTER ---------- */}
          <div className="text-center mt-8 text-xs text-slate-500">
            <p>© 2026 AMC College. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* ---------- DELETE CONFIRMATION MODAL ---------- */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in border border-white/50">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg">Delete Notification</h3>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-slate-700 text-sm leading-relaxed mb-2">
                Are you sure you want to delete this notification?
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {confirmDelete.title || "Untitled"}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {confirmDelete.message || "—"}
                </p>
              </div>
              <p className="text-xs text-red-600 font-medium flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                This action cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={!!deletingId}
                className="px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete._id)}
                disabled={!!deletingId}
                className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-semibold rounded-xl hover:from-red-600 hover:to-rose-700 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 flex items-center gap-2"
              >
                {deletingId ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Stat Card ---------------- */
function StatCard({ label, value, gradient, icon, isText }) {
  const icons = {
    bell: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    ),
    star: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    ),
    clock: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg border border-slate-100 p-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`}
      ></div>
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {icons[icon]}
          </svg>
        </div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p
        className={`font-bold text-slate-800 ${
          isText ? "text-base truncate" : "text-3xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* ---------------- Notification Card ---------------- */
function NotificationCard({
  n,
  index,
  timeAgo,
  formatDate,
  mounted,
  onDelete,
  isDeleting,
}) {
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-purple-500 to-pink-600",
    "from-orange-500 to-red-600",
    "from-cyan-500 to-blue-600",
  ];
  const gradient = gradients[index % gradients.length];

  return (
    <div
      className={`group relative bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-xl hover:border-slate-200 transition-all duration-300 overflow-hidden ${
        isDeleting ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      {/* Left accent bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
      ></div>

      <div className="flex items-start gap-4">
        {/* Avatar with initials */}
        <div className="flex-shrink-0">
          <div
            className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}
          >
            <span className="text-white font-bold text-lg">
              {n.title?.charAt(0).toUpperCase() || "N"}
            </span>
          </div>
          <div className="mt-2 flex justify-center">
            <span className="text-[10px] font-bold text-slate-400">
              #{index + 1}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
            <h3 className="text-base md:text-lg font-bold text-slate-800 break-words leading-snug">
              {n.title || "Untitled"}
            </h3>

            <div className="flex items-center gap-2">
              {mounted && n.createdAt && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-[11px] font-semibold rounded-full whitespace-nowrap">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                  {timeAgo(n.createdAt)}
                </span>
              )}

              {/* DELETE BUTTON */}
              <button
                onClick={onDelete}
                disabled={isDeleting}
                title="Delete notification"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap break-words mb-3">
            {n.message || "—"}
          </p>

          <div className="flex items-center gap-4 pt-3 border-t border-dashed border-slate-100">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {mounted ? formatDate(n.createdAt) : "—"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              Announcement
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}