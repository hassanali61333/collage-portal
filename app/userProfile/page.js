// app/profile/page.js
"use client";
import { getadmissionbyid } from "@/app/services/service.js";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { loginUser } from "@/app/redux/authSlice.js";
import UserSidebar from "@/app/components/userSidebar.js";

export default function UserProfile() {
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

    const getadmission = async () => {
      try {
        setLoading(true);
        setError(null);

        const studentId = auth?.id;
        if (!studentId) {
          setError("Student ID not found in user data");
          setLoading(false);
          return;
        }

        const res = await getadmissionbyid(studentId);

        if (res.data.success && res.data.data) {
          setAdmissionData(res.data.data);
        } else {
          setError(res.data.message || "Admission not found");
        }
      } catch (err) {
        console.error("Error:", err);
        setError(
          err.response?.data?.message || err.message || "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    getadmission();
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
    const styles = {
      pending: "bg-amber-400/20 text-amber-200 border-amber-300/30",
      approved: "bg-emerald-400/20 text-emerald-200 border-emerald-300/30",
      rejected: "bg-red-400/20 text-red-200 border-red-300/30",
    };
    return styles[status] || styles.pending;
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
              <div className="relative w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            </div>
            <p className="text-slate-600 font-medium animate-pulse text-sm">
              Loading your profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- ERROR / NO ADMISSION ---------------- */
  if (error || !admissionData) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <UserSidebar />
        <div className="flex-1 min-w-0 flex items-center justify-center p-4 md:p-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-900/5 p-8 md:p-12 max-w-md w-full text-center border border-slate-200">
            <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Admission Record</h2>
            <p className="text-slate-500 mb-6 text-sm">
              {error || "You haven't filled the admission form yet."}
            </p>
            <button
              onClick={() => router.push("/admission")}
              className="w-full px-6 py-3 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 text-sm"
            >
              Fill Admission Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN PROFILE ---------------- */
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <UserSidebar />

      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
          {/* ---------- HERO HEADER ---------- */}
          <div className="relative bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-900/30 mb-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

            <div className="relative p-6 md:p-8 lg:p-10">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Profile Picture */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-60" />
                  {admissionData.picture ? (
                    <img
                      src={admissionData.picture}
                      alt={admissionData.name}
                      className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover ring-4 ring-white/20 shadow-2xl"
                    />
                  ) : (
                    <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center ring-4 ring-white/20 shadow-2xl">
                      <span className="text-5xl font-bold text-white">
                        {admissionData.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-400 rounded-full border-4 border-slate-900 shadow-lg" />
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <p className="text-xs font-semibold text-indigo-300 uppercase tracking-[0.2em] mb-2">
                    My Profile
                  </p>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                    {admissionData.name}
                  </h1>

                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md text-white text-xs md:text-sm rounded-full border border-white/20">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {admissionData.classInAdmission}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md text-white text-xs md:text-sm rounded-full border border-white/20">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {admissionData.shift?.charAt(0).toUpperCase() + admissionData.shift?.slice(1)} Shift
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm rounded-full border font-medium backdrop-blur-md ${getStatusBadge(admissionData.status)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {admissionData.status?.charAt(0).toUpperCase() + admissionData.status?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- INFO CARDS GRID ---------- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Personal Information */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-900/5 border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/30">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                  <p className="text-xs text-slate-500">Your basic details</p>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InfoRow label="Full Name" value={admissionData.name} icon="user" />
                <InfoRow label="Date of Birth" value={formatDate(admissionData.dateOfBirth)} icon="calendar" />
                <InfoRow label="CNIC / B-Form" value={admissionData.cnicNo} icon="id" />
                <InfoRow label="Contact Number" value={admissionData.contactNo} icon="phone" />
              </div>
            </div>

            {/* Academic Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-900/5 border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/30">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Academics</h2>
                  <p className="text-xs text-slate-500">Class details</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <InfoRow label="Class" value={admissionData.classInAdmission} icon="book" />
                <InfoRow label="Shift" value={admissionData.shift?.charAt(0).toUpperCase() + admissionData.shift?.slice(1)} icon="clock" />
                <InfoRow label="Board" value={admissionData.boardOfLastClass} icon="academic" />
                <InfoRow label="Roll No" value={admissionData.rollNoOfLastClass} icon="hash" />
              </div>
            </div>

            {/* Father / Guardian Info */}
            <div className="lg:col-span-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-900/5 border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/30">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Father / Guardian Information</h2>
                  <p className="text-xs text-slate-500">Family details</p>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
                <InfoRow label="Father's Name" value={admissionData.fatherName} icon="user" />
                <InfoRow label="Father's CNIC" value={admissionData.fatherCnic} icon="id" />
                <InfoRow label="Father's Contact" value={admissionData.fatherContact} icon="phone" />
              </div>
            </div>
          </div>

          {/* ---------- FOOTER NOTE ---------- */}
          <div className="mt-8 text-center text-xs text-slate-400">
            <p>
              Admission submitted on{" "}
              <strong className="text-slate-700">
                {formatDate(admissionData.admissionDate)}
              </strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Reusable Info Row ---------------- */
function InfoRow({ label, value, icon }) {
  const icons = {
    user: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />),
    calendar: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />),
    id: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.418.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />),
    phone: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />),
    book: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />),
    clock: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />),
    academic: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z M12 14l-6.16-3.422" />),
    hash: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />),
  };

  return (
    <div className="group p-3 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50/60 hover:to-purple-50/60 transition-all duration-200">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-md bg-indigo-50 group-hover:bg-gradient-to-tr group-hover:from-indigo-500 group-hover:to-purple-500 flex items-center justify-center transition-all">
          <svg className="w-3.5 h-3.5 text-indigo-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icons[icon]}
          </svg>
        </div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className="text-sm md:text-base font-semibold text-slate-900 break-words">
        {value || "N/A"}
      </p>
    </div>
  );
}