// app/admission/update/page.js
"use client";
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import {
  updateAdmissionByStudentId,
  getadmissionbyid,
} from "@/app/services/service.js";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/app/redux/authSlice";
import UserSidebar from "../components/userSidebar";

// ---------- react-icons ----------
import {
  FiEdit3,
  FiUser,
  FiAlertCircle,
  FiCheck,
  FiArrowLeft,
} from "react-icons/fi";

// ─────────────────────────────────────────────
// ✅ Constants OUTSIDE component
// ─────────────────────────────────────────────
const CLASS_OPTIONS = [
  { value: "Class 11", label: "Class 11" },
  { value: "Class 12", label: "Class 12" },
];

const BOARD_OPTIONS = [
  { value: "Punjab Board", label: "Punjab Board" },
  { value: "Sindh Board", label: "Sindh Board" },
  { value: "KPK Board", label: "KPK Board" },
  { value: "Balochistan Board", label: "Balochistan Board" },
  { value: "Federal Board", label: "Federal Board" },
  { value: "Other", label: "Other" },
];

const INITIAL_FORM = {
  name: "",
  dateOfBirth: "",
  cnicNo: "",
  contactNo: "",
  classInAdmission: "",
  numberInLastClass: "",
  rollNoOfLastClass: "",
  boardOfLastClass: "",
  fatherName: "",
  fatherCnic: "",
  fatherContact: "",
  shift: "",
};

// ─────────────────────────────────────────────
// ✅ Reusable memoized field components (B&W theme)
// ─────────────────────────────────────────────
const InputField = memo(function InputField({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  required,
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-2">
        {label} {required && <span className="text-black">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-neutral-50 border ${
          error
            ? "border-black ring-1 ring-black"
            : "border-neutral-200 focus:border-black focus:ring-1 focus:ring-black"
        } rounded-lg focus:outline-none focus:bg-white transition-all text-[13px] text-black placeholder-neutral-400 font-medium`}
      />
      {error && (
        <p className="text-black text-xs mt-1.5 font-semibold flex items-center gap-1">
          <FiAlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
});

const SelectField = memo(function SelectField({
  label,
  name,
  value,
  onChange,
  error,
  options,
  placeholder = "Select",
  required,
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-2">
        {label} {required && <span className="text-black">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 bg-neutral-50 border ${
          error
            ? "border-black ring-1 ring-black"
            : "border-neutral-200 focus:border-black focus:ring-1 focus:ring-black"
        } rounded-lg focus:outline-none focus:bg-white transition-all text-[13px] text-black font-medium`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-black text-xs mt-1.5 font-semibold flex items-center gap-1">
          <FiAlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function UpdateAdmission() {
  const router = useRouter();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(INITIAL_FORM);

  useEffect(() => {
    if (auth) return;
    const data = localStorage.getItem("user");
    if (!data) return;

    try {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === "object") {
        dispatch(loginUser(parsed));
      } else {
        localStorage.removeItem("user");
      }
    } catch (err) {
      console.error("Corrupted user JSON:", err);
      localStorage.removeItem("user");
    }
  }, [auth, dispatch]);

  const studentId = auth?.id;

  useEffect(() => {
    if (!studentId) return;

    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      setLoading(true);
      setFetchError("");
      try {
        const response = await getadmissionbyid(studentId);
        if (cancelled) return;

        let admission = response?.data?.data ?? response?.data ?? null;
        if (typeof admission === "string") {
          try {
            admission = JSON.parse(admission);
          } catch {
            admission = null;
          }
        }

        if (!admission || typeof admission !== "object") {
          setFetchError("No admission record found.");
          setLoading(false);
          return;
        }

        const rawDate = admission.dateOfBirth;
        let formattedDate = "";
        if (rawDate) {
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            formattedDate = d.toISOString().split("T")[0];
          }
        }

        setFormData({
          name: admission.name || "",
          dateOfBirth: formattedDate,
          cnicNo: admission.cnicNo || "",
          contactNo: admission.contactNo || "",
          classInAdmission: admission.classInAdmission || "",
          numberInLastClass: admission.numberInLastClass || "",
          rollNoOfLastClass: admission.rollNoOfLastClass || "",
          boardOfLastClass: admission.boardOfLastClass || "",
          fatherName: admission.fatherName || "",
          fatherCnic: admission.fatherCnic || "",
          fatherContact: admission.fatherContact || "",
          shift: admission.shift || "",
        });
        setLoading(false);
      } catch (error) {
        if (cancelled) return;
        console.error("Error fetching admission:", error);
        setFetchError(
          error.response?.data?.message || "Failed to load admission data."
        );
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [studentId]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (prev[name] === value) return prev;
      return { ...prev, [name]: value };
    });
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const validate = useCallback((data) => {
    const e = {};
    if (!data.name) e.name = "Name is required";
    if (!data.dateOfBirth) e.dateOfBirth = "Date of birth is required";
    if (!data.cnicNo) e.cnicNo = "CNIC is required";
    if (!data.contactNo) e.contactNo = "Contact is required";
    if (!data.classInAdmission) e.classInAdmission = "Class is required";
    if (!data.fatherName) e.fatherName = "Father's name is required";
    if (!data.fatherCnic) e.fatherCnic = "Father's CNIC is required";
    if (!data.fatherContact) e.fatherContact = "Father's contact is required";
    if (!data.shift) e.shift = "Shift is required";
    return e;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    if (!studentId) {
      alert("Student ID not found. Please log in again.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await updateAdmissionByStudentId(studentId, formData);
      const ok =
        response?.data?.success !== false && (response?.status ?? 200) < 400;

      if (ok) {
        alert("Admission updated successfully!");
        router.push("/userDashboard");
      } else {
        alert(response?.data?.message || "Something went wrong!");
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Error updating admission. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-neutral-50">
      <div className="w-full md:w-[210px] md:min-w-[210px] flex-shrink-0">
        <UserSidebar />
      </div>

      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">

          {/* ---------- Header ---------- */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center flex-shrink-0">
                <FiEdit3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-black tracking-tight">
                  Update Admission
                </h1>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Modify your application details
                </p>
              </div>
            </div>
          </div>

          <div className="relative bg-white rounded-2xl border border-neutral-200 overflow-hidden">

            {/* Top accent bar (black) */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-black" />

            {/* Card header */}
            <div className="px-5 py-4 flex items-center gap-3 border-b border-neutral-100">
              <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                <FiUser className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-black text-sm md:text-base font-bold tracking-tight">
                  Student Information
                </h2>
                <p className="text-neutral-500 text-xs">
                  Update the fields you want to change
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-2 border-neutral-200" />
                  <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-black animate-spin" />
                </div>
                <p className="mt-4 text-xs text-neutral-500 font-medium">
                  Loading admission data
                </p>
              </div>
            ) : fetchError ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <FiAlertCircle className="w-7 h-7 text-black" />
                </div>
                <p className="text-black text-sm font-semibold mb-4">{fetchError}</p>
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center gap-2 text-sm text-black font-semibold hover:underline"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Go back
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 md:p-6">

                {/* ---------- Personal Information ---------- */}
                <div className="mb-8">
                  <h3 className="text-[13px] font-bold text-black mb-4 flex items-center gap-2 tracking-tight">
                    <span className="w-1 h-5 bg-black rounded-full" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      placeholder="Enter your full name"
                      required
                    />
                    <InputField
                      label="Date of Birth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      error={errors.dateOfBirth}
                      required
                    />
                    <InputField
                      label="CNIC / B-Form"
                      name="cnicNo"
                      value={formData.cnicNo}
                      onChange={handleChange}
                      error={errors.cnicNo}
                      placeholder="XXXXX-XXXXXXX-X"
                      required
                    />
                    <InputField
                      label="Contact Number"
                      name="contactNo"
                      value={formData.contactNo}
                      onChange={handleChange}
                      error={errors.contactNo}
                      placeholder="03XX-XXXXXXX"
                      required
                    />
                    <SelectField
                      label="Shift"
                      name="shift"
                      value={formData.shift}
                      onChange={handleChange}
                      error={errors.shift}
                      placeholder="Select Shift"
                      options={[
                        { value: "morning", label: "Morning" },
                        { value: "evening", label: "Evening" },
                      ]}
                      required
                    />
                  </div>
                </div>

                {/* ---------- Academic Information ---------- */}
                <div className="mb-8">
                  <h3 className="text-[13px] font-bold text-black mb-4 flex items-center gap-2 tracking-tight">
                    <span className="w-1 h-5 bg-black rounded-full" />
                    Academic Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectField
                      label="Applying for Class"
                      name="classInAdmission"
                      value={formData.classInAdmission}
                      onChange={handleChange}
                      error={errors.classInAdmission}
                      placeholder="Select Class"
                      options={CLASS_OPTIONS}
                      required
                    />
                    <InputField
                      label="Number in Last Class"
                      name="numberInLastClass"
                      value={formData.numberInLastClass}
                      onChange={handleChange}
                      placeholder="e.g., 45"
                    />
                    <InputField
                      label="Roll No of Last Class"
                      name="rollNoOfLastClass"
                      value={formData.rollNoOfLastClass}
                      onChange={handleChange}
                      placeholder="e.g., 2023-001"
                    />
                    <SelectField
                      label="Board of Last Class"
                      name="boardOfLastClass"
                      value={formData.boardOfLastClass}
                      onChange={handleChange}
                      placeholder="Select Board"
                      options={BOARD_OPTIONS}
                    />
                  </div>
                </div>

                {/* ---------- Father / Guardian Information ---------- */}
                <div className="mb-8">
                  <h3 className="text-[13px] font-bold text-black mb-4 flex items-center gap-2 tracking-tight">
                    <span className="w-1 h-5 bg-black rounded-full" />
                    Father / Guardian Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Father's Name"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      error={errors.fatherName}
                      placeholder="Enter father's name"
                      required
                    />
                    <InputField
                      label="Father's CNIC"
                      name="fatherCnic"
                      value={formData.fatherCnic}
                      onChange={handleChange}
                      error={errors.fatherCnic}
                      placeholder="XXXXX-XXXXXXX-X"
                      required
                    />
                    <InputField
                      label="Father's Contact"
                      name="fatherContact"
                      value={formData.fatherContact}
                      onChange={handleChange}
                      error={errors.fatherContact}
                      placeholder="03XX-XXXXXXX"
                      required
                    />
                  </div>
                </div>

                {/* ---------- Submit ---------- */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-5 border-t border-neutral-100">
                  <div className="text-xs text-neutral-500 font-medium">
                    <span className="text-black font-bold">*</span> Required fields
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      disabled={submitting}
                      className="flex-1 sm:flex-none px-5 py-3 bg-neutral-100 text-black font-semibold text-[13px] rounded-lg hover:bg-neutral-200 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 sm:flex-none px-6 py-3 bg-black text-white font-semibold text-[13px] rounded-lg hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <FiCheck className="w-4 h-4" />
                          Update Application
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          <div className="text-center mt-8 text-neutral-400 text-xs font-medium">
            <p>© 2026 AMC College</p>
          </div>
        </div>
      </div>
    </div>
  );
}