// app/dashboard/page.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/app/redux/authSlice.js";
import { getadmissionbyid } from "@/app/services/service.js";
import UserSidebar from "@/app/components/userSidebar.js";

// ---------- react-icons ----------
import {
  HiOutlineUser,
  HiOutlinePencil,
  HiOutlineCheckCircle,
  HiOutlineBookOpen,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineArrowRight,
  HiOutlineChevronRight,
} from "react-icons/hi";

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

  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-white text-neutral-700 border-neutral-300",
      approved: "bg-black text-white border-black",
      rejected: "bg-neutral-50 text-neutral-400 border-neutral-200",
    };
    return styles[status] || styles.pending;
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
      <div className="flex flex-col md:flex-row min-h-screen bg-white">
        <UserSidebar />
        <div className="flex-1 min-w-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-neutral-200" />
              <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-black animate-spin" />
            </div>
            <p className="text-neutral-500 text-xs font-medium">Loading dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN DASHBOARD ---------------- */
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-neutral-50">
      <UserSidebar />

      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-10">

          {/* ---------- HEADER ---------- */}
          <div className="bg-black rounded-2xl mb-6 md:mb-8 border border-neutral-800 animate-fade-in-up">
            <div className="px-6 py-7 md:px-10 md:py-9">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

                <div className="flex-shrink-0">
                  {admissionData?.picture ? (
                    <img
                      src={admissionData.picture}
                      alt={admissionData.name}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover border border-white/15"
                    />
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-white flex items-center justify-center border border-white/15">
                      <span className="text-2xl md:text-3xl font-semibold text-black">
                        {getInitials(admissionData?.name || auth?.name)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left min-w-0">
                  <p className="text-xs font-medium text-white/50 mb-2">Welcome back</p>
                  <h1 className="text-2xl md:text-[2rem] leading-tight font-semibold text-white mb-4 tracking-tight">
                    {admissionData?.name || auth?.name || "Student"}
                  </h1>

                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {admissionData?.classInAdmission && (
                      <span className="inline-flex items-center px-3 py-1 bg-white/10 text-white text-xs rounded-md border border-white/15 font-medium">
                        {admissionData.classInAdmission}
                      </span>
                    )}
                    {admissionData?.shift && (
                      <span className="inline-flex items-center px-3 py-1 bg-white/10 text-white text-xs rounded-md border border-white/15 font-medium">
                        {admissionData.shift.charAt(0).toUpperCase() + admissionData.shift.slice(1)} Shift
                      </span>
                    )}
                    {admissionData?.status && (
                      <span
                        className={`inline-flex items-center px-3 py-1 text-xs rounded-md border font-medium ${getStatusStyle(
                          admissionData.status
                        )}`}
                      >
                        {admissionData.status.charAt(0).toUpperCase() + admissionData.status.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- NO ADMISSION ---------- */}
          {!admissionData ? (
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden animate-fade-in-up">
              <div className="h-1 bg-black" />
              <div className="px-8 py-16 md:px-14 text-center max-w-md mx-auto">
                <div className="w-14 h-14 mx-auto rounded-xl bg-black flex items-center justify-center mb-6">
                  <HiOutlineDocumentText className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-black mb-2 tracking-tight">
                  No admission record
                </h2>
                <p className="text-neutral-500 text-sm leading-relaxed mb-7">
                  You haven't filled the admission form yet. Please fill it to continue.
                </p>
                <button
                  onClick={() => router.push("/admission")}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-neutral-800 hover:gap-3 transition-all duration-200"
                >
                  Fill admission form
                  <HiOutlineArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ---------- STATS ---------- */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">

                {/* Status — featured with inline styles + hover lift */}
                <div
                  className="transition-transform duration-300 hover:-translate-y-1 animate-fade-in-up"
                  style={{
                    backgroundColor: "#000",
                    marginLeft: "1px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    borderRadius: "0.75rem",
                    padding: "1rem",
                    animationDelay: "0ms",
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center flex-shrink-0">
                      <HiOutlineCheckCircle className="w-3.5 h-3.5 text-black" />
                    </div>
                    <p className="text-[10px] font-semibold text-white/60 uppercase tracking-wide">Status</p>
                  </div>
                  <p className="text-[15px] font-semibold text-white break-words tracking-tight truncate">
                    {admissionData.status?.charAt(0).toUpperCase() + admissionData.status?.slice(1) || "N/A"}
                  </p>
                </div>

                {/* Class */}
                <div
                  className="bg-white rounded-xl border border-neutral-200 p-4 hover:border-neutral-400 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: "50ms" }}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-md bg-black flex items-center justify-center flex-shrink-0">
                      <HiOutlineBookOpen className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Class</p>
                  </div>
                  <p className="text-[15px] font-semibold text-black break-words tracking-tight truncate">
                    {admissionData.classInAdmission || "N/A"}
                  </p>
                </div>

                {/* Shift */}
                <div
                  className="bg-white rounded-xl border border-neutral-200 p-4 hover:border-neutral-400 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: "100ms" }}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-md bg-black flex items-center justify-center flex-shrink-0">
                      <HiOutlineClock className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Shift</p>
                  </div>
                  <p className="text-[15px] font-semibold text-black break-words tracking-tight truncate">
                    {admissionData.shift?.charAt(0).toUpperCase() + admissionData.shift?.slice(1) || "N/A"}
                  </p>
                </div>

                {/* Submitted */}
                <div
                  className="bg-white rounded-xl border border-neutral-200 p-4 hover:border-neutral-400 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: "150ms" }}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-md bg-black flex items-center justify-center flex-shrink-0">
                      <HiOutlineCalendar className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Submitted</p>
                  </div>
                  <p className="text-[15px] font-semibold text-black break-words tracking-tight truncate">
                    {formatDate(admissionData.admissionDate)}
                  </p>
                </div>
              </div>

              {/* ---------- MAIN GRID ---------- */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">

                <div
                  className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: "200ms" }}
                >
                  <SectionHeader title="Personal Summary" subtitle="Your basic details" />
                  <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                    <InfoRow label="Full Name" value={admissionData.name} />
                    <InfoRow label="Date of Birth" value={formatDate(admissionData.dateOfBirth)} />
                    <InfoRow label="CNIC / B-Form" value={admissionData.cnicNo} />
                    <InfoRow label="Contact Number" value={admissionData.contactNo} />
                    <InfoRow label="Father's Name" value={admissionData.fatherName} />
                    <InfoRow label="Father's Contact" value={admissionData.fatherContact} />
                  </div>
                </div>

                <div
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: "250ms" }}
                >
                  <SectionHeader title="Quick Actions" subtitle="Shortcuts" />
                  <div className="p-3">
                    <ActionButton
                      label="View Full Profile"
                      icon={<HiOutlineUser className="w-4 h-4" />}
                      onClick={() => router.push("/userProfile")}
                    />
                    <ActionButton
                      label="Edit Admission"
                      icon={<HiOutlinePencil className="w-4 h-4" />}
                      onClick={() => router.push("/userForm")}
                    />
                  </div>
                </div>

                <div
                  className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: "300ms" }}
                >
                  <SectionHeader title="Academic Details" subtitle="Class information" />
                  <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                    <InfoRow label="Class" value={admissionData.classInAdmission} />
                    <InfoRow label="Shift" value={admissionData.shift?.charAt(0).toUpperCase() + admissionData.shift?.slice(1)} />
                    <InfoRow label="Board" value={admissionData.boardOfLastClass} />
                    <InfoRow label="Roll No" value={admissionData.rollNoOfLastClass} />
                  </div>
                </div>

                <div
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: "350ms" }}
                >
                  <SectionHeader title="Profile Completion" subtitle="Setup progress" />
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
                          <div className="flex items-baseline justify-between mb-4">
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-semibold text-black tracking-tight leading-none">
                                {percent}
                              </span>
                              <span className="text-base text-neutral-400 font-medium">%</span>
                            </div>
                            <span className="text-xs text-neutral-400 font-medium">
                              {filled}/{fields.length} complete
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden mb-6">
                            <div
                              className="h-full bg-black rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <ul className="space-y-3 list-none p-0 m-0">
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

          <div className="mt-12 text-center">
            <p className="text-xs text-neutral-400 font-medium">
              © 2026 AMC College
            </p>
          </div>
        </div>
      </div>

      {/* ---------- Global CSS animations (injected once) ---------- */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out both;
        }
      `}</style>
    </div>
  );
}

/* ---------------- Section Header ---------------- */
function SectionHeader({ title, subtitle }) {
  return (
    <div className="px-6 py-5 border-b border-neutral-100">
      <h2 className="text-sm font-semibold text-black tracking-tight">
        {title}
      </h2>
      <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>
    </div>
  );
}

/* ---------------- Action Button ---------------- */
function ActionButton({ label, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-all duration-200 group text-left"
    >
      <div className="w-8 h-8 rounded-lg bg-neutral-100 group-hover:bg-black flex items-center justify-center transition-colors duration-200 flex-shrink-0">
        <span className="text-neutral-700 group-hover:text-white transition-colors duration-200">
          {icon}
        </span>
      </div>
      <span className="text-[13px] font-medium text-neutral-800 group-hover:text-black flex-1 truncate">
        {label}
      </span>
      <HiOutlineChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-black group-hover:translate-x-0.5 transition-all duration-200" />
    </button>
  );
}

/* ---------------- Info Row ---------------- */
function InfoRow({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mb-1.5">
        {label}
      </p>
      <p className="text-[13px] font-medium text-black truncate">
        {value || "N/A"}
      </p>
    </div>
  );
}

/* ---------------- Completion Item ---------------- */
function CompletionItem({ done, label }) {
  return (
    <li className="flex items-center gap-2.5">
      <span
        className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
          done ? "bg-black" : "bg-neutral-200"
        }`}
      >
        {done ? (
          <HiOutlineCheckCircle className="w-3 h-3 text-white" />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
        )}
      </span>
      <span
        className={`text-xs transition-colors duration-200 ${
          done ? "text-black font-medium" : "text-neutral-400"
        }`}
      >
        {label}
      </span>
    </li>
  );
}