"use client"
import { useRouter } from "next/navigation";
  import Header from  "../app/components/header.js";

export default function Home() {
  const totalSeats = 4765;
  const seatsAvailable = 44;
  const morningAvailable = 18;
  const morningTotal = 2689;
  const eveningAvailable = 26;
  const eveningTotal = 2076;
  const filledPercent = Math.round(
    ((totalSeats - seatsAvailable) / totalSeats) * 100
  );

  const tags = [
    { label: "Model College" },
    { label: "Boys" },
    { label: "Both Shift" },
    { label: "Cambridge", accent: true },
    { label: "ECE", danger: true },
    { label: "Admissions Open", success: true },
  ];

const router =useRouter()


  return (
    <main className="min-h-screen bg-[#0a0e0d] text-white">
      {/* Top Nav */}

      <header className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-lg">
            🏛️
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">
            Abdullah Model College
            </p>
            <p className="text-xs text-white/40 leading-tight">
              Islamabad, Pakistan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          
         
          <button onClick={()=> router.push("/signup")} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:border-white/30">
            Signup
          </button>
          <button className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400">
            Get Access
          </button>
        </div>
      </header>

      {/* Body */}
      <section className="mx-auto max-w-6xl px-8 py-14">
        <button className="mb-24 flex items-center gap-2 text-sm text-white/50 hover:text-white/80">
          <span>←</span> Back to All Schools
        </button>

        <div className="flex flex-col items-start justify-between gap-16 md:flex-row md:items-end">
          {/* Left: title block */}
          <div>
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-wide text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              MODEL COLLEGES SECTOR
            </div>

            <h1 className="mb-6 text-5xl font-extrabold leading-none">
              AMC G-6/3
            </h1>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.label}
                  className={
                    "rounded-full px-3 py-1 text-xs font-semibold border " +
                    (tag.accent
                      ? "border-indigo-400/30 bg-indigo-500/15 text-indigo-300"
                      : tag.danger
                      ? "border-rose-400/30 bg-rose-500/15 text-rose-300"
                      : tag.success
                      ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300"
                      : "border-white/15 bg-white/5 text-white/70")
                  }
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: seats card */}
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="mb-2 text-center text-xs font-semibold tracking-wide text-white/40">
              SEATS AVAILABLE
            </p>
            <p className="text-center text-6xl font-extrabold text-emerald-400">
              {seatsAvailable}
            </p>
            <p className="mb-5 text-center text-xs text-white/40">
              of {totalSeats.toLocaleString()} total seats
            </p>

            <div className="mb-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <p className="mb-1 flex items-center gap-1 text-xs text-white/50">
                  <span className="text-sky-400">👤</span> Morning
                </p>
                <p className="text-xl font-bold text-sky-400">
                  {morningAvailable}
                </p>
                <p className="text-[11px] text-white/40">
                  / {morningTotal.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <p className="mb-1 flex items-center gap-1 text-xs text-white/50">
                  <span className="text-orange-400">🌙</span> Evening
                </p>
                <p className="text-xl font-bold text-orange-400">
                  {eveningAvailable}
                </p>
                <p className="text-[11px] text-white/40">
                  / {eveningTotal.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-rose-500"
                style={{ width: `${filledPercent}%` }}
              />
            </div>
            <p className="mb-5 text-center text-xs text-white/40">
              {filledPercent}% filled
            </p>

            <div className="border-t border-white/10 pt-4 text-center">
              <p className="text-xs text-white/40">Open until</p>
              <p className="text-sm font-bold">30 Jun 2026</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}