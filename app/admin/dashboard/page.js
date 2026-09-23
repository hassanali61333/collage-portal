"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/sidebar";
import { useSelector } from "react-redux";
import {
  getAllAdmissions,
  updateAdmissionByStudentId,
  deleteAdmissionByStudentId,
} from "@/app/services/service.js";

// ---------- react-icons ----------
import {
  HiOutlinePlus,
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineEmojiSad,
} from "react-icons/hi";

export default function Dashboard() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editFormData, setEditFormData] = useState({
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
    status: "pending",
  });
  const auth = useSelector((state) => state.auth.user);

  // ✅ Stats
  const stats = useMemo(() => {
    const total = students.length;
    const approved = students.filter((s) => s.status === "approved").length;
    const pending = students.filter(
      (s) => !s.status || s.status === "pending"
    ).length;
    const rejected = students.filter((s) => s.status === "rejected").length;
    const uniqueClasses = new Set(
      students.map((s) => s.classInAdmission).filter(Boolean)
    ).size;

    return { total, approved, pending, rejected, classes: uniqueClasses };
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.studentId || s.id || "").toString().toLowerCase().includes(q) ||
        (s.classInAdmission || "").toLowerCase().includes(q) ||
        (s.fatherName || "").toLowerCase().includes(q) ||
        (s.status || "").toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllAdmissions();
      const studentsData = response?.data?.data || response?.data || [];
      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleEdit = useCallback((student) => {
    setEditingStudent(student);
    setEditFormData({
      name: student.name || "",
      dateOfBirth: student.dateOfBirth
        ? String(student.dateOfBirth).slice(0, 10)
        : "",
      cnicNo: student.cnicNo || "",
      contactNo: student.contactNo || "",
      classInAdmission: student.classInAdmission || "",
      numberInLastClass: student.numberInLastClass || "",
      rollNoOfLastClass: student.rollNoOfLastClass || "",
      boardOfLastClass: student.boardOfLastClass || "",
      fatherName: student.fatherName || "",
      fatherCnic: student.fatherCnic || "",
      fatherContact: student.fatherContact || "",
      status: student.status || "pending",
    });
    setShowEditModal(true);
  }, []);

  const handleEditChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleEditSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const studentId = editingStudent.studentId || editingStudent.id;
        await updateAdmissionByStudentId(studentId, editFormData);
        await fetchStudents();
        setShowEditModal(false);
        setEditingStudent(null);
      } catch (error) {
        console.error("Error updating student:", error);
        alert(error?.response?.data?.message || "Failed to update student");
      } finally {
        setLoading(false);
      }
    },
    [editingStudent, editFormData, fetchStudents]
  );

  const handleStatusChange = useCallback(
    async (student, newStatus) => {
      const studentId = student.studentId || student.id;
      if (!studentId) return;

      const prevStudents = students;
      setStudents((prev) =>
        prev.map((s) =>
          (s.studentId || s.id) === studentId
            ? { ...s, status: newStatus }
            : s
        )
      );

      try {
        await updateAdmissionByStudentId(studentId, { status: newStatus });
      } catch (error) {
        console.error("Error updating status:", error);
        alert(error?.response?.data?.message || "Failed to update status");
        setStudents(prevStudents);
      }
    },
    [students]
  );

  const handleDelete = useCallback(
    async (student) => {
      const studentId = student.studentId || student.id;
      if (
        window.confirm(
          `Are you sure you want to delete student ${studentId}?`
        )
      ) {
        setLoading(true);
        try {
          await deleteAdmissionByStudentId(studentId);
          await fetchStudents();
        } catch (error) {
          console.error("Error deleting student:", error);
        } finally {
          setLoading(false);
        }
      }
    },
    [fetchStudents]
  );

  const handleAddNew = useCallback(() => {
    router.push("/admin/students");
  }, [router]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-neutral-50">
      {/* ---------- Sidebar ---------- */}
      <div className="w-full md:w-[210px] md:min-w-[210px] flex-shrink-0">
        <Sidebar />
      </div>

      {/* ---------- Main Content ---------- */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-10 py-8 md:py-10">

          {/* ---------- HEADER (subtle orange accent) ---------- */}
          <div className="relative bg-white rounded-2xl mb-6 md:mb-8 border border-neutral-200 border-l-4 border-l-orange-500 overflow-hidden">
            <div className="px-6 py-7 md:px-8 md:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-orange-100">
                  <HiOutlineUsers className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold text-black tracking-tight">
                    Student Management
                  </h1>
                  <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    View and manage all student admissions
                  </p>
                </div>
              </div>

              <button
                onClick={handleAddNew}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 active:scale-[0.98] transition-all duration-200 shadow-sm self-start sm:self-auto"
              >
                <HiOutlinePlus className="w-4 h-4" />
                Add New Student
              </button>
            </div>
          </div>

          {/* ---------- STATS ---------- */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <StatCard
              label="Total Students"
              value={stats.total}
              icon={<HiOutlineUsers className="w-4 h-4" />}
              featured
            />
            <StatCard
              label="Approved"
              value={stats.approved}
              icon={<HiOutlineCheckCircle className="w-4 h-4" />}
            />
            <StatCard
              label="Pending"
              value={stats.pending}
              icon={<HiOutlineClock className="w-4 h-4" />}
            />
            <StatCard
              label="Rejected"
              value={stats.rejected}
              icon={<HiOutlineXCircle className="w-4 h-4" />}
            />
          </div>

          {/* ---------- STUDENTS TABLE ---------- */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Search bar */}
            <div className="px-4 md:px-6 py-4 border-b border-neutral-100 flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-black placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                />
              </div>
              <button
                onClick={fetchStudents}
                className="p-2.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
                title="Refresh"
              >
                <HiOutlineRefresh
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            <div className="overflow-x-auto">
              {loading && students.length === 0 ? (
                <LoadingSkeleton />
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-50 mb-4 border border-orange-100">
                    <HiOutlineEmojiSad className="w-8 h-8 text-orange-500" />
                  </div>
                  <p className="text-black text-base font-semibold tracking-tight">
                    {searchQuery
                      ? "No matching students found"
                      : "No students found"}
                  </p>
                  <p className="text-neutral-500 text-sm mt-1 mb-5">
                    {searchQuery
                      ? "Try a different search term"
                      : "Add your first student to get started"}
                  </p>
                  <button
                    onClick={handleAddNew}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-all"
                  >
                    <HiOutlinePlus className="w-4 h-4" />
                    Add First Student
                  </button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        Student ID
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left hidden md:table-cell text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        CNIC
                      </th>
                      <th className="px-4 py-3 text-left hidden lg:table-cell text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        Class
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left hidden sm:table-cell text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        Father's Name
                      </th>
                      <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredStudents.map((student, index) => (
                      <tr
                        key={student.studentId || student.id || index}
                        className="group hover:bg-orange-50/40 transition-all duration-200"
                      >
                        <td className="px-4 py-3.5 font-medium text-black whitespace-nowrap">
                          <span className="inline-flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            {student.studentId || student.id || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-black font-medium">
                          {student.name || "N/A"}
                        </td>
                        <td className="px-4 py-3.5 text-neutral-600 hidden md:table-cell font-mono text-xs">
                          {student.cnicNo || "N/A"}
                        </td>
                        <td className="px-4 py-3.5 text-neutral-600 hidden lg:table-cell">
                          {student.contactNo || "N/A"}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-semibold inline-block border border-orange-100">
                            {student.classInAdmission || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block capitalize border ${
                              student.status === "approved"
                                ? "bg-orange-600 text-white border-orange-600"
                                : student.status === "rejected"
                                ? "bg-white text-neutral-400 border-neutral-200 line-through"
                                : "bg-orange-50 text-orange-700 border-orange-200"
                            }`}
                          >
                            {student.status || "pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-neutral-600 hidden sm:table-cell">
                          {student.fatherName || "N/A"}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            {student.status !== "approved" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(student, "approved")
                                }
                                className="p-1.5 text-orange-600 hover:bg-orange-600 hover:text-white rounded-lg transition-all duration-200"
                                title="Approve"
                              >
                                <HiOutlineCheck className="w-4 h-4" />
                              </button>
                            )}

                            {student.status !== "rejected" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(student, "rejected")
                                }
                                className="p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-white rounded-lg transition-all duration-200"
                                title="Reject"
                              >
                                <HiOutlineX className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleEdit(student)}
                              className="p-1.5 text-orange-600 hover:bg-orange-600 hover:text-white rounded-lg transition-all duration-200"
                              title="Edit"
                            >
                              <HiOutlinePencil className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(student)}
                              className="p-1.5 text-orange-700 hover:bg-orange-700 hover:text-white rounded-lg transition-all duration-200"
                              title="Delete"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            {filteredStudents.length > 0 && (
              <div className="px-4 md:px-6 py-3 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-600 flex justify-between items-center flex-wrap gap-2">
                <span className="font-medium">
                  Showing{" "}
                  <span className="text-orange-600 font-bold">
                    {filteredStudents.length}
                  </span>{" "}
                  of{" "}
                  <span className="text-orange-600 font-bold">
                    {students.length}
                  </span>{" "}
                  student(s)
                </span>
                <button
                  onClick={fetchStudents}
                  className="text-orange-600 hover:text-orange-800 font-medium transition-all flex items-center gap-1"
                >
                  <HiOutlineRefresh className="w-3 h-3" />
                  Refresh
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-10">
            <p className="text-xs text-neutral-400 font-medium">
              © 2026 AMC College
            </p>
          </div>
        </div>
      </div>

      {/* ---------- EDIT MODAL ---------- */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowEditModal(false);
            setEditingStudent(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-neutral-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-white border-b border-neutral-100 px-6 py-4 flex justify-between items-center sticky top-0 z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100">
                  <HiOutlinePencil className="w-4 h-4 text-orange-600" />
                </div>
                <h2 className="text-black text-base md:text-lg font-semibold tracking-tight">
                  Edit Student
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStudent(null);
                }}
                className="text-neutral-400 hover:text-black hover:bg-neutral-100 transition-all duration-200 p-1.5 rounded-lg"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Full Name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  required
                />
                <FormField
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={editFormData.dateOfBirth}
                  onChange={handleEditChange}
                  required
                />
                <FormField
                  label="CNIC / B-Form"
                  name="cnicNo"
                  value={editFormData.cnicNo}
                  onChange={handleEditChange}
                  required
                  placeholder="XXXXX-XXXXXXX-X"
                />
                <FormField
                  label="Contact Number"
                  name="contactNo"
                  value={editFormData.contactNo}
                  onChange={handleEditChange}
                  required
                  placeholder="03XX-XXXXXXX"
                />
                <SelectField
                  label="Class"
                  name="classInAdmission"
                  value={editFormData.classInAdmission}
                  onChange={handleEditChange}
                  required
                  options={[
                    "Class 6",
                    "Class 7",
                    "Class 8",
                    "Class 9",
                    "Class 10",
                    "Class 11",
                    "Class 12",
                  ]}
                />
                <FormField
                  label="Number in Last Class"
                  name="numberInLastClass"
                  value={editFormData.numberInLastClass}
                  onChange={handleEditChange}
                  placeholder="e.g., 45"
                />
                <FormField
                  label="Roll No of Last Class"
                  name="rollNoOfLastClass"
                  value={editFormData.rollNoOfLastClass}
                  onChange={handleEditChange}
                  placeholder="e.g., 2023-001"
                />
                <SelectField
                  label="Board of Last Class"
                  name="boardOfLastClass"
                  value={editFormData.boardOfLastClass}
                  onChange={handleEditChange}
                  options={[
                    "Punjab Board",
                    "Sindh Board",
                    "KPK Board",
                    "Balochistan Board",
                    "Federal Board",
                    "Other",
                  ]}
                />
                <FormField
                  label="Father's Name"
                  name="fatherName"
                  value={editFormData.fatherName}
                  onChange={handleEditChange}
                  required
                  placeholder="Enter father's name"
                />
                <FormField
                  label="Father's CNIC"
                  name="fatherCnic"
                  value={editFormData.fatherCnic}
                  onChange={handleEditChange}
                  required
                  placeholder="XXXXX-XXXXXXX-X"
                />
                <div className="md:col-span-2">
                  <FormField
                    label="Father's Contact"
                    name="fatherContact"
                    value={editFormData.fatherContact}
                    onChange={handleEditChange}
                    required
                    placeholder="03XX-XXXXXXX"
                  />
                </div>

                <div className="md:col-span-2">
                  <SelectField
                    label="Status"
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditChange}
                    required
                    options={["pending", "approved", "rejected"]}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <HiOutlineCheck className="w-4 h-4" />
                      Update Student
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Stat Card ---------- */
function StatCard({ label, value, icon, featured = false }) {
  if (featured) {
    return (
      <div className="rounded-xl p-4 bg-orange-600 border border-orange-700 transition-all duration-300 hover:-translate-y-1 shadow-sm">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-md bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0 text-white">
            {icon}
          </div>
          <p className="text-[10px] font-semibold text-white/80 uppercase tracking-wide">
            {label}
          </p>
        </div>
        <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 hover:border-orange-300 hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-7 h-7 rounded-md bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600">
          {icon}
        </div>
        <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">
          {label}
        </p>
      </div>
      <p className="text-2xl font-bold text-black tabular-nums">{value}</p>
    </div>
  );
}

/* ---------- Form Field ---------- */
function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-orange-600">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:bg-white text-sm text-black placeholder-neutral-400 font-medium transition-all"
      />
    </div>
  );
}

/* ---------- Select Field ---------- */
function SelectField({ label, name, value, onChange, options, required }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-orange-600">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:bg-white text-sm text-black font-medium capitalize transition-all"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="capitalize">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ---------- Loading Skeleton ---------- */
function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-10 rounded-lg bg-neutral-100 animate-pulse"
        />
      ))}
    </div>
  );
}