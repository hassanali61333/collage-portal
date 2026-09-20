// app/dashboard/page.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/app/redux/authSlice.js";
import { getadmissionbyid } from "@/app/services/service.js";
import UserSidebar from "@/app/components/userSidebar.js";

export default function UserDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [admissionData, setAdmissionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const auth = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!auth) {
      const data = localStorage.getItem("user");
      if (data) {
        const parsedData = JSON.parse(data);
        dispatch(loginUser(parsedData));
      }
    }
  }, [auth, dispatch]);

  useEffect(() => {
    if (!auth) return;

    const fetchAdmission = async () => {
      try {
        setLoading(true);
        setError(null);
        const studentId = auth?.id;
        if (!studentId) {
          setError("Student ID not found");
          setLoading(false);
          return;
        }
        const res = await getadmissionbyid(studentId);
        if (res.data.success && res.data.data) {
          setAdmissionData(res.data.data);
        } else {
          setAdmissionData(null);
        }
      } catch (err) {
        console.error(err);
        setAdmissionData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmission();
  }, [auth]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-amber-400/20 text-amber-200 border-amber-300/30",
      approved: "bg-emerald-400/20 text-emerald-200 border-emerald-300/30",
      rejected: "bg-red-400/20 text-red-200 border-red-300/30",
    };
    return colors[status] || colors.pending;
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <UserSidebar />
        <div className="flex-1 min-w-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur-lg opacity-50" />
              <div className="relative w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            </div>
            <p className="text-slate-600 font-medium text-sm animate-pulse">
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN DASHBOARD ---------------- */
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <UserSidebar />

      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">

          {/* ---------- HERO HEADER ---------- */}
          <div className="relative bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-900/30 mb-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

            <div className="relative p-6 md:p-8 lg:p-10">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-60" />
                  {admissionData?.picture ? (
                    <img
                      src={admissionData.picture}
                      alt={admissionData.name}
                      className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover ring-4 ring-white/20 shadow-2xl"
                    />
                  ) : (
                    <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center ring-4 ring-white/20 shadow-2xl">
                      <span className="text-4xl md:text-5xl font-bold text-white">
                        {getInitials(admissionData?.name || auth?.name)}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-400 rounded-full border-4 border-slate-900 shadow-lg" />
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <p className="text-xs font-semibold text-indigo-300 uppercase tracking-[0.2em] mb-2">
                    Welcome back
                  </p>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                    {admissionData?.name || auth?.name || "Student"}
                  </h1>

                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {admissionData?.classInAdmission && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md text-white text-xs md:text-sm rounded-full border border-white/20">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {admissionData.classInAdmission}
                      </span>
                    )}
                    {admissionData?.shift && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md text-white text-xs md:text-sm rounded-full border border-white/20">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {admissionData.shift.charAt(0).toUpperCase() + admissionData.shift.slice(1)} Shift
                      </span>
                    )}
                    {admissionData?.status && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm rounded-full border font-medium backdrop-blur-md ${getStatusBadge(admissionData.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        {admissionData.status.charAt(0).toUpperCase() + admissionData.status.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- IF NO ADMISSION ---------- */}
          {!admissionData ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-200 overflow-hidden">
              <div className="p-8 md:p-12 text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">No Admission Record</h2>
                <p className="text-slate-500 mb-6 text-sm">
                  You haven't filled the admission form yet. Please fill it to continue.
                </p>
                <button
                  onClick={() => router.push("/admission")}
                  className="px-6 py-3 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 text-sm"
                >
                  Fill Admission Form
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ---------- STATS CARDS ---------- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6">
                <StatCard label="Admission Status" value={admissionData.status?.charAt(0).toUpperCase() + admissionData.status?.slice(1)} icon="check" color="indigo" />
                <StatCard label="Class" value={admissionData.classInAdmission || "N/A"} icon="book" color="purple" />
                <StatCard label="Shift" value={admissionData.shift?.charAt(0).toUpperCase() + admissionData.shift?.slice(1) || "N/A"} icon="clock" color="pink" />
                <StatCard label="Submitted On" value={formatDate(admissionData.admissionDate)} icon="calendar" color="emerald" />
              </div>

              {/* ---------- MAIN GRID ---------- */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

                {/* Quick Summary */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-900/5 border border-slate-200 overflow-hidden">
                  <SectionHeader icon="user" title="Personal Summary" subtitle="Your basic details" />
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InfoRow label="Full Name" value={admissionData.name} />
                    <InfoRow label="Date of Birth" value={formatDate(admissionData.dateOfBirth)} />
                    <InfoRow label="CNIC / B-Form" value={admissionData.cnicNo} />
                    <InfoRow label="Contact Number" value={admissionData.contactNo} />
                    <InfoRow label="Father's Name" value={admissionData.fatherName} />
                    <InfoRow label="Father's Contact" value={admissionData.fatherContact} />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-900/5 border border-slate-200 overflow-hidden">
                  <SectionHeader icon="bolt" title="Quick Actions" subtitle="Shortcuts" />
                  <div className="p-4 space-y-2">
                    <ActionButton label="View Full Profile" icon="user" onClick={() => router.push("/userProfile")} />
                    <ActionButton label="Edit Admission" icon="edit" onClick={() => router.push("/userForm")} />
                  </div>
                </div>

                {/* Academic Details */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-900/5 border border-slate-200 overflow-hidden">
                  <SectionHeader icon="book" title="Academic Details" subtitle="Class information" />
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InfoRow label="Class" value={admissionData.classInAdmission} />
                    <InfoRow label="Shift" value={admissionData.shift?.charAt(0).toUpperCase() + admissionData.shift?.slice(1)} />
                    <InfoRow label="Board" value={admissionData.boardOfLastClass} />
                    <InfoRow label="Roll No" value={admissionData.rollNoOfLastClass} />
                  </div>
                </div>

                {/* Profile Completion */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-900/5 border border-slate-200 overflow-hidden">
                  <SectionHeader icon="check" title="Profile Completion" subtitle="Setup progress" />
                  <div className="p-6">
                    {(() => {
                      const fields = [
                        admissionData.name, admissionData.dateOfBirth, admissionData.cnicNo,
                        admissionData.contactNo, admissionData.classInAdmission, admissionData.fatherName,
                        admissionData.fatherCnic, admissionData.fatherContact, admissionData.picture,
                      ];
                      const filled = fields.filter(Boolean).length;
                      const percent = Math.round((filled / fields.length) * 100);

                      return (
                        <>
                          <div className="flex items-baseline justify-between mb-2">
                            <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              {percent}%
                            </span>
                            <span className="text-xs text-slate-500">{filled}/{fields.length} completed</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 shadow-sm shadow-indigo-500/50"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <ul className="space-y-2 text-xs list-none p-0 m-0">
                            <CompletionItem done={!!admissionData.name} label="Personal Info" />
                            <CompletionItem done={!!admissionData.classInAdmission} label="Academic Info" />
                            <CompletionItem done={!!admissionData.fatherName} label="Guardian Info" />
                            <CompletionItem done={!!admissionData.picture} label="Profile Picture" />
                          </ul>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="mt-8 text-center text-xs text-slate-400">
            <p>© 2026 AMC College. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Section Header ---------------- */
function SectionHeader({ icon, title, subtitle }) {
  const icons = {
    user: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />),
    book: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />),
    bolt: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />),
    check: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />),
    bell: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />),
  };

  return (
    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/30">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[icon]}</svg>
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

/* ---------------- Stat Card ---------------- */
function StatCard({ label, value, icon, color = "indigo" }) {
  const icons = {
    check: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />),
    book: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />),
    clock: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />),
    calendar: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />),
  };

  const colors = {
    indigo: "from-indigo-500 to-indigo-600 shadow-indigo-500/30",
    purple: "from-purple-500 to-purple-600 shadow-purple-500/30",
    pink: "from-pink-500 to-pink-600 shadow-pink-500/30",
    emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/30",
  };

  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-900/5 border border-slate-200 p-5 hover:shadow-xl hover:shadow-slate-900/10 hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${colors[color]} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[icon]}</svg>
        </div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-base md:text-lg font-bold text-slate-900 break-words">{value || "N/A"}</p>
    </div>
  );
}

/* ---------------- Action Button ---------------- */
function ActionButton({ label, icon, onClick }) {
  const icons = {
    user: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />),
    edit: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />),
    download: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />),
    settings: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />),
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 group text-left"
    >
      <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-gradient-to-tr group-hover:from-indigo-500 group-hover:to-purple-500 flex items-center justify-center transition-all flex-shrink-0">
        <svg className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[icon]}</svg>
      </div>
      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{label}</span>
      <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

/* ---------------- Info Row ---------------- */
function InfoRow({ label, value }) {
  return (
    <div className="group p-3 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-200">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-sm md:text-base font-semibold text-slate-900 break-words">{value || "N/A"}</p>
    </div>
  );
}

/* ---------------- Completion Item ---------------- */
function CompletionItem({ done, label }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
        done ? "bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-sm shadow-indigo-500/40" : "bg-slate-200"
      }`}>
        {done && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span className={done ? "text-slate-900 font-medium" : "text-slate-400"}>{label}</span>
    </li>
  );
}