// app/profile/page.js
"use client";
import { getadmissionbyid } from "@/app/services/service.js";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { loginUser } from "@/app/redux/authSlice.js";
import UserSidebar from "@/app/components/userSidebar.js";

// ---------- react-icons imports ----------
import {
  FiUser,
  FiCalendar,
  FiCreditCard,
  FiPhone,
  FiBookOpen,
  FiClock,
  FiHash,
  FiFileText,
  FiAward,
  FiUsers,
} from "react-icons/fi";

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

  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-white text-neutral-700 border-neutral-300",
      approved: "bg-black text-white border-black",
      rejected: "bg-neutral-50 text-neutral-400 border-neutral-200",
    };
    return styles[status] || styles.pending;
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-white">
        <UserSidebar />
        <div className="flex-1 min-w-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-neutral-200" />
              <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-black animate-spin" />
            </div>
            <p className="text-neutral-500 text-xs font-medium">Loading your profile</p>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- ERROR / NO ADMISSION ---------------- */
  if (error || !admissionData) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-white">
        <UserSidebar />
        <div className="flex-1 min-w-0 flex items-center justify-center p-4 md:p-8">
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 md:p-12 max-w-md w-full text-center">
            <div className="w-14 h-14 mx-auto rounded-xl bg-black flex items-center justify-center mb-6">
              <FiFileText className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-black mb-2 tracking-tight">
              No admission record
            </h2>
            <p className="text-neutral-500 mb-7 text-sm leading-relaxed">
              {error || "You haven't filled the admission form yet."}
            </p>
            <button
              onClick={() => router.push("/admission")}
              className="w-full px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors duration-150"
            >
              Fill admission form
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN PROFILE ---------------- */
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-neutral-50">
      <UserSidebar />

      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-10">

          {/* ---------- HERO HEADER ---------- */}
          <div className="bg-black rounded-2xl mb-6 md:mb-8 border border-neutral-800">
            <div className="px-6 py-7 md:px-10 md:py-9">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  {admissionData.picture ? (
                    <img
                      src={admissionData.picture}
                      alt={admissionData.name}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover border border-white/15"
                    />
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-white flex items-center justify-center border border-white/15">
                      <span className="text-2xl md:text-3xl font-semibold text-black">
                        {admissionData.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left min-w-0">
                  <p className="text-xs font-medium text-white/50 mb-2">My Profile</p>
                  <h1 className="text-2xl md:text-[2rem] leading-tight font-semibold text-white mb-4 tracking-tight">
                    {admissionData.name}
                  </h1>

                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {admissionData.classInAdmission && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white text-xs rounded-md border border-white/15 font-medium">
                        <FiBookOpen className="w-3.5 h-3.5 text-white/70" />
                        {admissionData.classInAdmission}
                      </span>
                    )}
                    {admissionData.shift && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white text-xs rounded-md border border-white/15 font-medium">
                        <FiClock className="w-3.5 h-3.5 text-white/70" />
                        {admissionData.shift.charAt(0).toUpperCase() + admissionData.shift.slice(1)} Shift
                      </span>
                    )}
                    {admissionData.status && (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-md border font-medium ${getStatusStyle(
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

          {/* ---------- INFO CARDS GRID ---------- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">

            {/* Personal Information */}
           <div className="lg:col-span-2 bg-white rounded-2xl border-l-3 border-l-black border-neutral-200 overflow-hidden">
              <SectionHeader
                icon={<FiUser className="w-4 h-4 text-white" />}
                title="Personal Information"
                subtitle="Your basic details"
              />
              <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                <InfoRow icon={<FiUser />} label="Full Name" value={admissionData.name} />
                <InfoRow icon={<FiCalendar />} label="Date of Birth" value={formatDate(admissionData.dateOfBirth)} />
                <InfoRow icon={<FiCreditCard />} label="CNIC / B-Form" value={admissionData.cnicNo} />
                <InfoRow icon={<FiPhone />} label="Contact Number" value={admissionData.contactNo} />
              </div>
            </div>

            {/* Academic Info */}
            <div className="bg-white rounded-2xl border-l-3 border-l-black overflow-hidden">
              <SectionHeader
                icon={<FiBookOpen className="w-4 h-4 text-white" />}
                title="Academics"
                subtitle="Class details"
              />
              <div className="px-6 py-6 space-y-5">
                <InfoRow icon={<FiBookOpen />} label="Class" value={admissionData.classInAdmission} />
                <InfoRow icon={<FiClock />} label="Shift" value={admissionData.shift?.charAt(0).toUpperCase() + admissionData.shift?.slice(1)} />
                <InfoRow icon={<FiAward />} label="Board" value={admissionData.boardOfLastClass} />
                <InfoRow icon={<FiHash />} label="Roll No" value={admissionData.rollNoOfLastClass} />
              </div>
            </div>

            {/* Father / Guardian Info */}
            <div className="lg:col-span-3 bg-white rounded-2xl border-l-3 border-l-black overflow-hidden">
              <SectionHeader
                icon={<FiUsers className="w-4 h-4 text-white" />}
                title="Father / Guardian Information"
                subtitle="Family details"
              />
              <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-6">
                <InfoRow icon={<FiUser />} label="Father's Name" value={admissionData.fatherName} />
                <InfoRow icon={<FiCreditCard />} label="Father's CNIC" value={admissionData.fatherCnic} />
                <InfoRow icon={<FiPhone />} label="Father's Contact" value={admissionData.fatherContact} />
              </div>
            </div>
          </div>

          {/* ---------- FOOTER NOTE ---------- */}
          <div className="mt-10 text-center">
            <p className="text-xs text-neutral-400 font-medium">
              Admission submitted on{" "}
              <strong className="text-black">
                {formatDate(admissionData.admissionDate)}
              </strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Section Header ---------------- */
function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="px-6 py-5 border-b border-neutral-100 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-black tracking-tight">
          {title}
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

/* ---------------- Info Row ---------------- */
function InfoRow({ label, value, icon }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-neutral-400 text-sm flex-shrink-0">
          {icon}
        </span>
        <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">
          {label}
        </p>
      </div>
      <p className="text-[13px] font-medium text-black truncate">
        {value || "N/A"}
      </p>
    </div>
  );
}