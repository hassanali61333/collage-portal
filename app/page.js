"use client";
import { useState, useEffect, useMemo } from "react";
import {
  getSeatAvailability,
  getAdmissionSettings,
} from "@/app/services/service.js";
import { useRouter } from "next/navigation";

// ---------- react-icons ----------
import {
  HiOutlineArrowLeft,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineLocationMarker,
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineUserAdd,
  HiOutlineClipboardList,
  HiOutlineSparkles,
  HiOutlineTrendingUp,
} from "react-icons/hi";

export default function SchoolProfilePage() {
  const [seats, setSeats] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const router = useRouter();

  // ---- seats ----
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSeatAvailability();
        const data = res?.data?.data || res?.data || [];
        setSeats(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load seats:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ---- admission settings ----
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await getAdmissionSettings();
        const data = res?.data?.data;
        setSettings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load admission settings:", err);
        setError("Failed to load admission settings");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  // ---- pick admission-open-until ----
  const admissionOpenUntil = useMemo(() => {
    if (!settings.length) return null;
    return settings[0]?.admissionOpenUntil || null;
  }, [settings]);

  const formatOpenUntil = (val) => {
    if (!val) return "—";
    const d = new Date(val);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ---- seat stats ----
  const stats = useMemo(() => {
    let totalSeats = 0;
    let totalFilled = 0;

    const morning = { total: 0, filled: 0 };
    const evening = { total: 0, filled: 0 };

    for (const s of seats) {
      const t = Number(s.totalSeats) || 0;
      const f = Number(s.filledSeats) || 0;

      totalSeats += t;
      totalFilled += f;

      const shift = String(s.shift || "").toLowerCase();
      if (shift === "morning") {
        morning.total += t;
        morning.filled += f;
      } else if (shift === "evening") {
        evening.total += t;
        evening.filled += f;
      }
    }

    const remaining = Math.max(totalSeats - totalFilled, 0);
    const percentFilled =
      totalSeats > 0
        ? Math.min(Math.round((totalFilled / totalSeats) * 100), 100)
        : 0;

    return {
      totalSeats,
      totalFilled,
      remaining,
      percentFilled,
      morning: {
        total: morning.total,
        filled: morning.filled,
        remaining: Math.max(morning.total - morning.filled, 0),
      },
      evening: {
        total: evening.total,
        filled: evening.filled,
        remaining: Math.max(evening.total - evening.filled, 0),
      },
    };
  }, [seats]);

  const formatNum = (n) => n.toLocaleString("en-US");

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-emerald-400 animate-spin" />
          </div>
          <p className="text-[10px] text-neutral-500 font-semibold tracking-[0.3em] uppercase">
            Loading
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ---------- HEADER ---------- */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="w-full mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
              <HiOutlineAcademicCap className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm md:text-base font-semibold text-white tracking-tight truncate">
                Abdullah Model College
              </h1>
              <p className="text-[11px] text-neutral-400 flex items-center gap-1 truncate">
                <HiOutlineLocationMarker className="w-3 h-3" />
                Islamabad, Pakistan
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => router.push("/signup")}
              className="group inline-flex items-center gap-1.5 px-3 md:px-4 py-2 border border-white/15 hover:border-white/40 hover:bg-white/5 rounded-full text-xs md:text-sm font-semibold text-white transition-all duration-300"
            >
              <HiOutlineUserAdd className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110" />
              <span className="hidden sm:inline">Signup</span>
            </button>
            <button
              onClick={() => router.push("/meritlist")}
              className="group inline-flex items-center gap-1.5 px-3 md:px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black rounded-full text-xs md:text-sm font-bold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-emerald-500/25"
            >
              <HiOutlineClipboardList className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-6" />
              <span className="hidden sm:inline">Merit List</span>
            </button>
          </div>
        </div>
      </header>

      {/* ---------- MAIN ---------- */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

        {/* Left — School Info */}
        <div>
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 text-neutral-400 hover:text-white text-sm font-medium mb-8 transition-colors duration-300"
          >
            <HiOutlineArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Back
          </button>

          <div className="lg:mt-20">
            <p className="text-[11px] font-bold tracking-[0.28em] uppercase mb-4 flex items-center gap-2 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Model Colleges Sector
            </p>

            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tighter leading-[0.95]">
              AMC
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                G-6/3
              </span>
            </h2>

            <div className="flex flex-wrap gap-2 mb-8">
              {["Model College", "Boys", "Both Shift", "Cambridge"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[11px] font-medium text-neutral-300 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5"
                  >
                    {tag}
                  </span>
                )
              )}
              <span className="px-3 py-1.5 border border-red-500/40 text-red-400/70 rounded-full text-[11px] font-medium line-through">
                ECE
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-black rounded-full text-[11px] font-bold shadow-lg shadow-emerald-500/20">
                <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                Admissions Open
              </span>
            </div>

            {/* Small info strip */}
            <div className="hidden lg:grid grid-cols-2 gap-3 max-w-md">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <HiOutlineSparkles className="w-3.5 h-3.5 text-amber-400" />
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Programs
                  </p>
                </div>
                <p className="text-sm font-semibold text-white">FSc · ICS</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <HiOutlineTrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Merit
                  </p>
                </div>
                <p className="text-sm font-semibold text-white">60%+</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Seats Card */}
        <div className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-500 shadow-2xl shadow-black/50">

          {/* Hero number */}
          <div className="relative p-6 md:p-8 text-center border-b border-white/10">
            {/* soft glow */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
            <p className="relative text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400 mb-3">
              Seats Available
            </p>
            <p className="relative text-6xl md:text-7xl font-black text-white tabular-nums leading-none tracking-tighter">
              {formatNum(stats.remaining)}
            </p>
            <p className="relative text-xs text-neutral-400 mt-3 font-medium">
              of {formatNum(stats.totalSeats)} total seats
            </p>
          </div>

          {/* Morning / Evening */}
          <div className="p-4 md:p-6 grid grid-cols-2 gap-3">
            <div className="group bg-amber-500/[0.08] border border-amber-500/20 rounded-2xl p-4 transition-all duration-300 hover:bg-amber-500/[0.15] hover:border-amber-500/40 hover:-translate-y-1">
              <div className="flex items-center gap-1.5 mb-2.5">
                <HiOutlineSun className="w-4 h-4 text-amber-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  Morning
                </p>
              </div>
              <p className="text-3xl font-black text-white tabular-nums leading-none">
                {formatNum(stats.morning.remaining)}
              </p>
              <p className="text-[10px] text-neutral-400 mt-1.5 font-medium">
                / {formatNum(stats.morning.total)} total
              </p>
            </div>

            <div className="group bg-indigo-500/[0.08] border border-indigo-500/20 rounded-2xl p-4 transition-all duration-300 hover:bg-indigo-500/[0.15] hover:border-indigo-500/40 hover:-translate-y-1">
              <div className="flex items-center gap-1.5 mb-2.5">
                <HiOutlineMoon className="w-4 h-4 text-indigo-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                  Evening
                </p>
              </div>
              <p className="text-3xl font-black text-white tabular-nums leading-none">
                {formatNum(stats.evening.remaining)}
              </p>
              <p className="text-[10px] text-neutral-400 mt-1.5 font-medium">
                / {formatNum(stats.evening.total)} total
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-4 md:px-6 pb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Occupancy
              </p>
              <p className="text-[11px] font-bold text-emerald-400 tabular-nums">
                {stats.percentFilled}%
              </p>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-emerald-500/30"
                style={{ width: `${stats.percentFilled}%` }}
              />
            </div>
          </div>

          {/* Open until */}
          <div className="px-4 md:px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HiOutlineCalendar className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                Open until
              </span>
            </div>
            <span className="text-sm font-bold text-white tabular-nums">
              {formatOpenUntil(admissionOpenUntil)}
            </span>
          </div>
        </div>
      </div>

      {/* ---------- FOOTER ---------- */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 pb-10 text-center">
        <p className="text-[10px] text-neutral-500 font-semibold tracking-[0.2em] uppercase">
          © 2026 AMC College
        </p>
      </div>
    </div>
  );
}