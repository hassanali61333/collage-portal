// app/userNotifications/page.js
"use client";
import { useState } from "react";
import Sidebar from "@/app/components/sidebar";
import { sendNotification } from "@/app/services/service.js";

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
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className="w-full md:w-[232px] md:min-w-[232px] flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
          {/* ---------- HERO HEADER ---------- */}
          <div className="relative bg-[rgb(26,24,24)] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl mb-6">
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">
                  Send Notification
                </h1>
                <p className="text-blue-200 text-sm md:text-base mb-3">
                  Broadcast an announcement instantly to all students
                </p>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white text-xs md:text-sm rounded-full border border-white/20">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    Live Broadcast
                  </span>
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    All Students
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- FORM CARD ---------- */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Compose Message
                </h2>
                <p className="text-xs text-slate-500">
                  Fill in the details below to broadcast
                </p>
              </div>
            </div>

            {/* Card Body */}
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              {/* Title */}
              <div className="group">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  <svg
                    className="w-3.5 h-3.5 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 7h.01M7 3h5a2 2 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  Notification Title
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Exam Schedule Announced"
                    maxLength={120}
                    className={`w-full px-4 py-3.5 bg-slate-50 border-2 ${
                      errors.title
                        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                    } rounded-xl focus:outline-none focus:ring-4 focus:bg-white transition-all text-sm text-slate-800 placeholder-slate-400 font-medium`}
                  />
                  {formData.title && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      {formData.title.length}/120
                    </span>
                  )}
                </div>
                {errors.title && (
                  <p className="flex items-center gap-1.5 text-red-500 text-xs mt-2 font-medium">
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
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="group">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  <svg
                    className="w-3.5 h-3.5 text-blue-500"
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
                  Message
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your notification message here..."
                  rows={6}
                  maxLength={maxChars}
                  className={`w-full px-4 py-3.5 bg-slate-50 border-2 ${
                    errors.message
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                  } rounded-xl focus:outline-none focus:ring-4 focus:bg-white transition-all text-sm text-slate-800 placeholder-slate-400 font-medium resize-none leading-relaxed`}
                />
                <div className="flex items-center justify-between mt-2">
                  {errors.message ? (
                    <p className="flex items-center gap-1.5 text-red-500 text-xs font-medium">
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
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {errors.message}
                    </p>
                  ) : (
                    <span className="text-xs text-slate-400">
                      Be clear and concise
                    </span>
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      remaining < 50 ? "text-orange-500" : "text-slate-400"
                    }`}
                  >
                    {formData.message.length}/{maxChars}
                  </span>
                </div>
              </div>

              {/* Preview (if message exists) */}
              {formData.message.trim() && (
                <div className="rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-4">
                  <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Live Preview
                  </p>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">
                    {formData.title || "Notification Title"}
                  </h4>
                  <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {formData.message}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ title: "", message: "" });
                    setErrors({});
                  }}
                  disabled={submitting}
                  className="px-5 py-3 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm transform hover:-translate-y-0.5"
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
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
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      Send Notification
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ---------- INFO NOTE ---------- */}
          <div className="mt-6 flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl">
            <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Notification will be sent instantly
              </p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Once sent, the announcement will be visible to all students in
                their notification feed immediately.
              </p>
            </div>
          </div>

          {/* ---------- FOOTER ---------- */}
          <div className="text-center mt-8 text-xs text-slate-500">
            <p>© 2026 AMC College. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* ---------- TOAST ---------- */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-bottom duration-300 ${
            toast.type === "error"
              ? "bg-white border-red-200 text-red-600"
              : "bg-white border-green-200 text-green-700"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              toast.type === "error"
                ? "bg-red-100"
                : "bg-green-100"
            }`}
          >
            {toast.type === "error" ? (
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
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          <p className="text-sm font-semibold">{toast.text}</p>
        </div>
      )}
    </div>
  );
}