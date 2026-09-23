// app/userNotifications/page.js
"use client";
import { useState } from "react";
import Sidebar from "@/app/components/sidebar";
import { sendNotification } from "@/app/services/service.js";

// ---------- react-icons ----------
import {
  HiOutlinePaperAirplane,
  HiOutlineUsers,
  HiOutlinePencil,
  HiOutlineTag,
  HiOutlineChatAlt,
  HiOutlineEye,
  HiOutlineInformationCircle,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
} from "react-icons/hi";

export default function NotificationsPage() {
  const [formData, setFormData] = useState({ title: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await sendNotification({
        title: formData.title.trim(),
        message: formData.message.trim(),
      });

      if (res?.data?.success !== false) {
        showToast("Notification sent successfully!", "success");
        setFormData({ title: "", message: "" });
      } else {
        showToast(res?.data?.error || "Something went wrong", "error");
      }
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to send notification",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const maxChars = 500;
  const remaining = maxChars - formData.message.length;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <div className="w-full md:w-[232px] md:min-w-[232px] flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-10 py-8 md:py-10">

          {/* ---------- HEADER (subtle orange accent) ---------- */}
          <div className="relative bg-white rounded-2xl mb-6 md:mb-8 border border-neutral-200 border-l-4 border-l-orange-500 overflow-hidden">
            <div className="px-6 py-7 md:px-8 md:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-orange-100">
                  <HiOutlinePaperAirplane className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold text-black tracking-tight">
                    Send Notification
                  </h1>
                  <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    Broadcast an announcement instantly to all students
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-100 text-orange-700 text-xs rounded-full font-semibold">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                  Live Broadcast
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs rounded-full font-semibold">
                  <HiOutlineUsers className="w-3.5 h-3.5" />
                  All Students
                </span>
              </div>
            </div>
          </div>

          {/* ---------- FORM CARD ---------- */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                <HiOutlinePencil className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-black tracking-tight">
                  Compose Message
                </h2>
                <p className="text-xs text-neutral-500">
                  Fill in the details below to broadcast
                </p>
              </div>
            </div>

            {/* Card Body */}
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              {/* Title */}
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-2">
                  <HiOutlineTag className="w-3.5 h-3.5 text-orange-500" />
                  Notification Title
                  <span className="text-orange-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Exam Schedule Announced"
                    maxLength={120}
                    className={`w-full px-4 py-3.5 bg-neutral-50 border ${
                      errors.title
                        ? "border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                        : "border-neutral-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    } rounded-lg focus:outline-none focus:bg-white transition-all text-sm text-black placeholder-neutral-400 font-medium`}
                  />
                  {formData.title && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-neutral-400 tabular-nums">
                      {formData.title.length}/120
                    </span>
                  )}
                </div>
                {errors.title && (
                  <p className="flex items-center gap-1.5 text-black text-[11px] mt-1.5 font-semibold">
                    <HiOutlineExclamationCircle className="w-3.5 h-3.5" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-2">
                  <HiOutlineChatAlt className="w-3.5 h-3.5 text-orange-500" />
                  Message
                  <span className="text-orange-600">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your notification message here..."
                  rows={6}
                  maxLength={maxChars}
                  className={`w-full px-4 py-3.5 bg-neutral-50 border ${
                    errors.message
                      ? "border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                      : "border-neutral-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  } rounded-lg focus:outline-none focus:bg-white transition-all text-sm text-black placeholder-neutral-400 font-medium resize-none leading-relaxed`}
                />
                <div className="flex items-center justify-between mt-2">
                  {errors.message ? (
                    <p className="flex items-center gap-1.5 text-black text-[11px] font-semibold">
                      <HiOutlineExclamationCircle className="w-3.5 h-3.5" />
                      {errors.message}
                    </p>
                  ) : (
                    <span className="text-[11px] text-neutral-400 font-medium">
                      Be clear and concise
                    </span>
                  )}
                  <span
                    className={`text-[11px] font-semibold tabular-nums ${
                      remaining < 50 ? "text-orange-600" : "text-neutral-400"
                    }`}
                  >
                    {formData.message.length}/{maxChars}
                  </span>
                </div>
              </div>

              {/* Preview */}
              {formData.message.trim() && (
                <div className="rounded-lg border border-dashed border-orange-200 bg-orange-50/40 p-4">
                  <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <HiOutlineEye className="w-3.5 h-3.5" />
                    Live Preview
                  </p>
                  <h4 className="text-sm font-bold text-black mb-1">
                    {formData.title || "Notification Title"}
                  </h4>
                  <p className="text-xs text-neutral-600 whitespace-pre-wrap leading-relaxed">
                    {formData.message}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ title: "", message: "" });
                    setErrors({});
                  }}
                  disabled={submitting}
                  className="px-5 py-3 text-sm font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-all disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {submitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <HiOutlinePaperAirplane className="w-4 h-4" />
                      Send Notification
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ---------- INFO NOTE ---------- */}
          <div className="mt-6 flex items-start gap-3 p-4 bg-white border border-neutral-200 border-l-4 border-l-orange-500 rounded-2xl">
            <div className="flex-shrink-0 w-9 h-9 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center">
              <HiOutlineInformationCircle className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-black tracking-tight">
                Notification will be sent instantly
              </p>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Once sent, the announcement will be visible to all students in
                their notification feed immediately.
              </p>
            </div>
          </div>

          {/* ---------- FOOTER ---------- */}
          <div className="text-center mt-10">
            <p className="text-xs text-neutral-400 font-medium">
              © 2026 AMC College
            </p>
          </div>
        </div>
      </div>

      {/* ---------- TOAST ---------- */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-4 rounded-2xl shadow-lg border flex items-center gap-3 ${
            toast.type === "error"
              ? "bg-white border-neutral-300 text-black"
              : "bg-orange-600 border-orange-700 text-white"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              toast.type === "error"
                ? "bg-neutral-100 text-black"
                : "bg-white/15 text-white"
            }`}
          >
            {toast.type === "error" ? (
              <HiOutlineExclamationCircle className="w-4 h-4" />
            ) : (
              <HiOutlineCheckCircle className="w-4 h-4" />
            )}
          </div>
          <p className="text-sm font-semibold">{toast.text}</p>
        </div>
      )}
    </div>
  );
}