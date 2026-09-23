"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getapprovedstudents,
  getAdmissionSettings,
} from "@/app/services/service.js";

export default function MeritListPage() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Class 11");
  const [searchQuery, setSearchQuery] = useState("");

  // ---- load admission settings ----
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await getAdmissionSettings();
        const data = res?.data?.data;
        setSettings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load admission settings:", err);
      }
    };
    loadSettings();
  }, []);

  // ---- load approved students ----
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getapprovedstudents();
        const data = res?.data?.data || res?.data || [];
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("API Error:", err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ---- class options ----
  const classOptions = useMemo(() => {
    const set = new Set(
      students.map((s) => s.classInAdmission).filter(Boolean)
    );
    const arr = Array.from(set).sort();
    return arr.length > 0 ? arr : ["Class 11", "Class 12"];
  }, [students]);

  useEffect(() => {
    if (classOptions.length > 0 && !classOptions.includes(activeTab)) {
      setActiveTab(classOptions[0]);
    }
  }, [classOptions, activeTab]);

  // ---- current class setting (publish state + merit date) ----
  const currentSetting = useMemo(() => {
    if (!settings.length) return null;
    return (
      settings.find((s) => s.className === activeTab) || settings[0] || null
    );
  }, [settings, activeTab]);

  const isMeritPublished = !!currentSetting?.isMeritListPublished;
  const meritListDate = currentSetting?.meritListDate || null;

  const formatMeritDate = (val) => {
    if (!val) return "—";
    const d = new Date(val);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // ---- filtered + sorted students ----
  const filteredByClass = useMemo(() => {
    return students.filter((s) => s.classInAdmission === activeTab);
  }, [students, activeTab]);

  const sortedStudents = useMemo(() => {
    const list = [...filteredByClass];
    list.sort((a, b) => {
      const am = Number(a.meritNo) || 0;
      const bm = Number(b.meritNo) || 0;
      if (bm !== am) return bm - am;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.studentId || s._id || "").toString().toLowerCase().includes(q) ||
        (s.fatherName || "").toLowerCase().includes(q)
    );
  }, [filteredByClass, searchQuery]);

  const classStats = useMemo(() => {
    const total = filteredByClass.length;
    const morning = filteredByClass.filter(
      (s) => String(s.shift || "").toLowerCase() === "morning"
    ).length;
    const evening = filteredByClass.filter(
      (s) => String(s.shift || "").toLowerCase() === "evening"
    ).length;
    const merits = filteredByClass
      .map((s) => Number(s.meritNo) || 0)
      .filter((m) => m > 0);
    const avgMerit =
      merits.length > 0
        ? Math.round(merits.reduce((a, b) => a + b, 0) / merits.length)
        : 0;
    const topMerit = merits.length > 0 ? Math.max(...merits) : 0;
    return { total, morning, evening, avgMerit, topMerit };
  }, [filteredByClass]);

  const getShiftBadge = (shift) => {
    const s = String(shift || "").toLowerCase();
    return s === "morning"
      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
      : "bg-orange-500/10 text-orange-400 border-orange-500/30";
  };

  const getRankStyle = (rank) => {
    if (rank === 1)
      return "bg-gradient-to-br from-yellow-400 to-amber-500 text-black shadow-lg shadow-yellow-500/30";
    if (rank === 2)
      return "bg-gradient-to-br from-gray-300 to-gray-400 text-black shadow-lg shadow-gray-400/30";
    if (rank === 3)
      return "bg-gradient-to-br from-orange-400 to-orange-600 text-black shadow-lg shadow-orange-500/30";
    return "bg-white/5 text-gray-300 border border-white/10";
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("");

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white/20"
          >
            ←
          </button>
          <div>
            <h1 className="font-bold text-white">Merit List</h1>
            <p className="text-xs text-gray-400">
              Approved Admissions — Sorted by Merit
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs text-emerald-400 font-medium">
            Official Merit
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 relative z-10">
        {/* Title */}
        <div className="text-center mb-6">
          <p className="text-emerald-500 text-xs font-semibold tracking-[0.3em] mb-2">
            ABDULLAH MODEL COLLEGE
          </p>
          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-text">
            MERIT LIST 2026
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            First Merit List — Provisional
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-white/5 backdrop-blur border border-white/10 rounded-full p-1">
            {classOptions.map((cls) => (
              <button
                key={cls}
                onClick={() => setActiveTab(cls)}
                className={`px-6 md:px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === cls
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        {/* ⛔ NOT PUBLISHED → show "coming on <date>" */}
        {!isMeritPublished ? (
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl py-16 px-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 mb-5">
              <span className="text-4xl">⏳</span>
            </div>
            <p className="text-emerald-500 text-xs font-semibold tracking-[0.3em] mb-2">
              {activeTab.toUpperCase()}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Merit List Not Published Yet
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Merit list will be displayed on
            </p>
            <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">
              {formatMeritDate(meritListDate)}
            </p>
            <p className="text-xs text-gray-500 mt-4">
              Please check back on the above date.
            </p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
              <StatCard
                label="Selected Students"
                value={classStats.total}
                accent="from-emerald-500 to-green-500"
                icon="✓"
              />
              <StatCard
                label="Morning Shift"
                value={classStats.morning}
                accent="from-blue-500 to-cyan-500"
                icon="☀️"
              />
              <StatCard
                label="Evening Shift"
                value={classStats.evening}
                accent="from-orange-500 to-amber-500"
                icon="🌙"
              />
              <StatCard
                label="Top Merit"
                value={classStats.topMerit}
                accent="from-yellow-500 to-amber-500"
                icon="🏆"
                suffix="/100"
              />
            </div>

            {/* Search */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder={`Search in ${activeTab} merit list...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  <span className="text-emerald-500 font-bold">
                    {sortedStudents.length}
                  </span>{" "}
                  / {filteredByClass.length} listed
                </div>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <LoadingState />
            ) : sortedStudents.length === 0 ? (
              <EmptyState
                activeTab={activeTab}
                hasSearch={!!searchQuery}
                onClear={() => setSearchQuery("")}
              />
            ) : (
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/5 border-b border-white/10 px-4 md:px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
                    <h2 className="font-semibold text-white">
                      {activeTab} — Merit List
                    </h2>
                  </div>
                  <span className="text-xs text-gray-400">
                    Sorted by Merit (Highest First)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-16">
                          Rank
                        </th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                          Father's Name
                        </th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                          CNIC / B-Form
                        </th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Shift
                        </th>
                        <th className="px-3 md:px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Merit
                        </th>
                        <th className="px-3 md:px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedStudents.map((s, i) => {
                        const rank = i + 1;
                        const merit = Number(s.meritNo) || 0;

                        return (
                          <tr
                            key={s._id || s.studentId || i}
                            className={`group transition-colors duration-200 ${
                              rank <= 3
                                ? "bg-gradient-to-r from-yellow-500/5 to-transparent hover:from-yellow-500/10"
                                : "hover:bg-white/5"
                            }`}
                          >
                            <td className="px-3 md:px-4 py-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-transform duration-300 group-hover:scale-110 ${getRankStyle(
                                  rank
                                )}`}
                              >
                                {rank <= 3 ? (
                                  <span className="text-base">
                                    {rank === 1
                                      ? "🥇"
                                      : rank === 2
                                      ? "🥈"
                                      : "🥉"}
                                  </span>
                                ) : (
                                  rank
                                )}
                              </div>
                            </td>
                            <td className="px-3 md:px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-xs font-bold text-black shrink-0">
                                  {getInitials(s.name) || "?"}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-white truncate">
                                    {s.name || "N/A"}
                                  </p>
                                  <p className="text-xs text-gray-500 font-mono truncate">
                                    {s.studentId || s._id || "—"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 md:px-4 py-3 text-gray-400 hidden md:table-cell">
                              {s.fatherName || "—"}
                            </td>
                            <td className="px-3 md:px-4 py-3 text-gray-400 font-mono text-xs hidden lg:table-cell">
                              {s.cnicNo || "—"}
                            </td>
                            <td className="px-3 md:px-4 py-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${getShiftBadge(
                                  s.shift
                                )}`}
                              >
                                {s.shift || "—"}
                              </span>
                            </td>
                            <td className="px-3 md:px-4 py-3 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span
                                  className={`text-base font-bold tabular-nums ${
                                    merit >= 80
                                      ? "text-emerald-400"
                                      : merit >= 60
                                      ? "text-amber-400"
                                      : "text-orange-400"
                                  }`}
                                >
                                  {merit}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                  /100
                                </span>
                              </div>
                            </td>
                            <td className="px-3 md:px-4 py-3 text-center hidden sm:table-cell">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Approved
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="px-4 md:px-6 py-3 bg-white/5 border-t border-white/10 text-xs text-gray-500 flex flex-col sm:flex-row justify-between gap-2">
                  <span>
                    Total{" "}
                    <span className="text-emerald-500 font-bold">
                      {sortedStudents.length}
                    </span>{" "}
                    students in {activeTab} merit list
                  </span>
                  <span>
                    Generated on {new Date().toLocaleDateString("en-GB")}
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
          <p className="text-xs text-amber-400/80 text-center">
            ⚠️ This is a provisional merit list. Final merit list will be
            displayed after document verification.
          </p>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          © 2026 Abdullah Model College. All rights reserved.
        </p>
      </div>
    </div>
  );
}

/* ---------- Sub Components ---------- */

function StatCard({ label, value, accent, icon, suffix = "" }) {
  return (
    <div className="group relative bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 overflow-hidden transition-all duration-300 hover:border-white/20 hover:-translate-y-1">
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accent}`}
      ></div>
      <div
        className={`absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-br ${accent} opacity-10 group-hover:opacity-20 transition-opacity duration-300 blur-2xl`}
      ></div>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-xs text-gray-400 font-medium">{label}</p>
          <p className="text-2xl font-bold text-white mt-1 tabular-nums">
            {value}
            {suffix && (
              <span className="text-sm text-gray-500 font-normal ml-0.5">
                {suffix}
              </span>
            )}
          </p>
        </div>
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center text-lg shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 space-y-3">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-16 rounded-xl animate-pulse bg-white/5"></div>
      ))}
    </div>
  );
}

function EmptyState({ activeTab, hasSearch, onClear }) {
  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl py-16 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/10 to-green-500/10 mb-4">
        <svg
          className="w-10 h-10 text-emerald-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <p className="text-gray-300 text-lg font-medium mb-1">
        {hasSearch
          ? "No matching students"
          : `No approved students in ${activeTab}`}
      </p>
      <p className="text-gray-500 text-sm mb-4">
        {hasSearch
          ? "Try adjusting your search query"
          : "Merit list will appear here once admissions are approved"}
      </p>
      {hasSearch && (
        <button
          onClick={onClear}
          className="px-4 py-2 bg-emerald-500 text-black font-semibold rounded-full text-sm transition-all duration-300 hover:bg-emerald-400 hover:scale-105 active:scale-95"
        >
          Clear Search
        </button>
      )}
    </div>
  );
}