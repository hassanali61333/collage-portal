// app/userNotifications/page.js
"use client";
import { useState, useEffect, useCallback } from "react";
import { getAllNotifications, deleteNotification } from "@/app/services/service.js";
import Sidebar from "@/app/components/sidebar";

// ---------- react-icons ----------
import {
  HiOutlineBell,
  HiOutlineClock,
  HiOutlineStar,
  HiOutlineClipboardList,
  HiOutlineRefresh,
  HiOutlineTrash,
  HiOutlineExclamation,
  HiOutlineChatAlt,
  HiOutlineCalendar,
  HiOutlineInbox,
  HiOutlineX,
} from "react-icons/hi";

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
    <div className="flex flex-col md:flex-row min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <div className="w-full md:w-[210px] md:min-w-[210px] flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-10 py-8 md:py-10">

          {/* ---------- HEADER (subtle orange accent) ---------- */}
          <div className="relative bg-white rounded-2xl mb-6 md:mb-8 border border-neutral-200 border-l-4 border-l-orange-500 overflow-hidden">
            <div className="px-6 py-7 md:px-8 md:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-orange-100">
                  <HiOutlineBell className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold text-black tracking-tight">
                    Notifications
                  </h1>
                  <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    Stay updated with all announcements from AMC College
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-100 text-orange-700 text-xs rounded-full font-semibold">
                  <HiOutlineClipboardList className="w-3.5 h-3.5" />
                  {notifications.length} Total
                </span>
                {mounted && notifications[0]?.createdAt && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs rounded-full font-semibold">
                    <HiOutlineClock className="w-3.5 h-3.5" />
                    Updated {timeAgo(notifications[0].createdAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ---------- STAT CARDS ---------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6">
            <StatCard
              label="Total Notifications"
              value={notifications.length}
              icon={<HiOutlineBell className="w-4 h-4" />}
              featured
            />
            <StatCard
              label="Latest Title"
              value={notifications[0]?.title || "—"}
              icon={<HiOutlineStar className="w-4 h-4" />}
              isText
            />
            <StatCard
              label="Last Updated"
              value={
                mounted && notifications[0]?.createdAt
                  ? timeAgo(notifications[0].createdAt)
                  : "—"
              }
              icon={<HiOutlineClock className="w-4 h-4" />}
              isText
            />
          </div>

          {/* ---------- NOTIFICATIONS LIST ---------- */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
            {/* Card header */}
            <div className="px-5 md:px-6 py-4 border-b border-neutral-100 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
                  <HiOutlineInbox className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-black tracking-tight">
                    All Notifications
                  </h2>
                  <p className="text-[11px] text-neutral-500">
                    {notifications.length} total records
                  </p>
                </div>
              </div>

              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50 shadow-sm"
              >
                <HiOutlineRefresh
                  className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>

            {/* Body */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-2 border-neutral-200" />
                  <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-orange-500 animate-spin" />
                </div>
                <p className="mt-4 text-xs text-neutral-500 font-medium">
                  Loading notifications
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="w-16 h-16 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <HiOutlineBell className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-base font-semibold text-black mb-1 tracking-tight">
                  No notifications yet
                </h3>
                <p className="text-neutral-500 text-sm">
                  Check back later for updates from the college
                </p>
              </div>
            ) : (
              <div className="p-4 md:p-6 space-y-3">
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

          {/* Footer */}
          <div className="text-center mt-10">
            <p className="text-xs text-neutral-400 font-medium">
              © 2026 AMC College
            </p>
          </div>
        </div>
      </div>

      {/* ---------- DELETE MODAL ---------- */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-neutral-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
                  <HiOutlineTrash className="w-4 h-4 text-orange-600" />
                </div>
                <h3 className="text-black font-semibold text-base tracking-tight">
                  Delete Notification
                </h3>
              </div>
              <button
                onClick={() => setConfirmDelete(null)}
                className="text-neutral-400 hover:text-black hover:bg-neutral-100 p-1.5 rounded-lg transition-all"
              >
                <HiOutlineX className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-neutral-700 text-sm leading-relaxed mb-3">
                Are you sure you want to delete this notification?
              </p>
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 mb-4">
                <p className="text-sm font-semibold text-black truncate">
                  {confirmDelete.title || "Untitled"}
                </p>
                <p className="text-xs text-neutral-500 truncate mt-0.5">
                  {confirmDelete.message || "—"}
                </p>
              </div>
              <p className="text-xs text-orange-700 font-semibold flex items-center gap-1.5">
                <HiOutlineExclamation className="w-3.5 h-3.5" />
                This action cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={!!deletingId}
                className="px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete._id)}
                disabled={!!deletingId}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-60 flex items-center gap-2 shadow-sm"
              >
                {deletingId ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <HiOutlineTrash className="w-4 h-4" />
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
function StatCard({ label, value, icon, featured = false, isText }) {
  if (featured) {
    return (
      <div className="rounded-xl p-4 bg-orange-600 border border-orange-700 transition-all duration-300 hover:-translate-y-1 shadow-sm">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-md bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0 text-white">
            {icon}
          </div>
          <p className="text-[10px] font-semibold text-white/80 uppercase tracking-wide">
            {label}
          </p>
        </div>
        <p
          className={`font-bold text-white tabular-nums ${
            isText ? "text-base truncate" : "text-2xl"
          }`}
        >
          {value}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 hover:border-orange-300 hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-7 h-7 rounded-md bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600">
          {icon}
        </div>
        <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">
          {label}
        </p>
      </div>
      <p
        className={`font-bold text-black tabular-nums ${
          isText ? "text-base truncate" : "text-2xl"
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
  // Subtle warm monochrome variations — no bright rainbows
  const accents = [
    "bg-orange-500",
    "bg-neutral-800",
    "bg-orange-400",
    "bg-neutral-700",
    "bg-orange-600",
  ];
  const accent = accents[index % accents.length];

  return (
    <div
      className={`group relative bg-white border border-neutral-200 rounded-2xl p-5 hover:border-orange-300 transition-all duration-300 overflow-hidden ${
        isDeleting ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      {/* Left accent bar on hover */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      ></div>

      <div className="flex items-start gap-4">
        {/* Index badge with initial */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
            <span className="text-orange-600 font-bold text-lg">
              {n.title?.charAt(0).toUpperCase() || "N"}
            </span>
          </div>
          <div className="mt-2 flex justify-center">
            <span className="text-[10px] font-bold text-neutral-400 tabular-nums">
              #{index + 1}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
            <h3 className="text-base md:text-lg font-semibold text-black break-words leading-snug tracking-tight">
              {n.title || "Untitled"}
            </h3>

            <div className="flex items-center gap-2">
              {mounted && n.createdAt && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 border border-orange-100 text-orange-700 text-[11px] font-semibold rounded-full whitespace-nowrap">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                  {timeAgo(n.createdAt)}
                </span>
              )}

              {/* Delete button */}
              <button
                onClick={onDelete}
                disabled={isDeleting}
                title="Delete notification"
                className="p-1.5 text-neutral-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {isDeleting ? (
                  <span className="inline-block w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <HiOutlineTrash className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap break-words mb-3">
            {n.message || "—"}
          </p>

          <div className="flex items-center gap-4 pt-3 border-t border-dashed border-neutral-100 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400 font-medium">
              <HiOutlineCalendar className="w-3.5 h-3.5" />
              {mounted ? formatDate(n.createdAt) : "—"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400 font-medium">
              <HiOutlineChatAlt className="w-3.5 h-3.5" />
              Announcement
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}