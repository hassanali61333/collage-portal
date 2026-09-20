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
  });
  const auth = useSelector((state) => state.auth.user);

  const stats = useMemo(() => {
    const activeAdmissions = students.filter((s) => s.classInAdmission).length;
    const uniqueClasses = new Set(
      students.map((s) => s.classInAdmission).filter(Boolean)
    ).size;
    return { total: students.length, active: activeAdmissions, classes: uniqueClasses };
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.studentId || s.id || "").toString().toLowerCase().includes(q) ||
        (s.classInAdmission || "").toLowerCase().includes(q) ||
        (s.fatherName || "").toLowerCase().includes(q)
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
      dateOfBirth: student.dateOfBirth || "",
      cnicNo: student.cnicNo || "",
      contactNo: student.contactNo || "",
      classInAdmission: student.classInAdmission || "",
      numberInLastClass: student.numberInLastClass || "",
      rollNoOfLastClass: student.rollNoOfLastClass || "",
      boardOfLastClass: student.boardOfLastClass || "",
      fatherName: student.fatherName || "",
      fatherCnic: student.fatherCnic || "",
      fatherContact: student.fatherContact || "",
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
      } finally {
        setLoading(false);
      }
    },
    [editingStudent, editFormData, fetchStudents]
  );

  const handleDelete = useCallback(
    async (student) => {
      const studentId = student.studentId || student.id;
      if (window.confirm(`Are you sure you want to delete student ${studentId}?`)) {
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Sidebar */}
   <div className="w-full md:w-[210px] md:min-w-[210px] flex-shrink-0 relative z-50">
  <Sidebar />
</div>

      {/* Main Content */}
      <div className="flex-1  p-[30px] md:p-6 lg:p-8 overflow-y-auto w-full max-w-5xl  m-auto relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4 animate-fade-in-down">
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Student Management
              </h1>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                View and manage all student admissions
              </p>
            </div>
            <button
              onClick={handleAddNew}
              className="group relative px-5 md:px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <svg
                className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <span className="relative z-10">Add New Student</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 mb-6 md:mb-8">
            <StatCard
              label="Total Students"
              value={stats.total}
              gradient="from-blue-500 to-cyan-500"
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              }
            />
            <StatCard
              label="Active Admissions"
              value={stats.active}
              gradient="from-green-500 to-emerald-500"
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              }
            />
            <StatCard
              label="Classes"
              value={stats.classes}
              gradient="from-purple-500 to-pink-500"
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              }
            />
          </div>

          {/* Students Table */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/50 animate-fade-in-up">
            {/* Search Bar */}
            <div className="px-4 md:px-6 py-4 border-b border-gray-200/50 flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/70 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <button
                onClick={fetchStudents}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                title="Refresh"
              >
                <svg
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            <div className="overflow-x-auto">
              {loading && students.length === 0 ? (
                <LoadingSkeleton />
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-16 animate-fade-in">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-4">
                    <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg font-medium">
                    {searchQuery ? "No matching students found" : "No students found"}
                  </p>
                  <button
                    onClick={handleAddNew}
                    className="mt-4 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Add First Student
                  </button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-[#0a0e0d] to-[#1a2422] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Student ID</th>
                      <th className="px-4 py-3 text-left font-semibold">Name</th>
                      <th className="px-4 py-3 text-left hidden md:table-cell font-semibold">CNIC</th>
                      <th className="px-4 py-3 text-left hidden lg:table-cell font-semibold">Contact</th>
                      <th className="px-4 py-3 text-left font-semibold">Class</th>
                      <th className="px-4 py-3 text-left hidden sm:table-cell font-semibold">Father's Name</th>
                      <th className="px-4 py-3 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map((student, index) => (
                      <tr
                        key={student.studentId || student.id || index}
                        className="group hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-indigo-50/70 transition-all duration-200 animate-fade-in-row"
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          <span className="inline-flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:animate-ping"></span>
                            {student.studentId || student.id || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-medium">{student.name || "N/A"}</td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell font-mono text-xs">
                          {student.cnicNo || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{student.contactNo || "N/A"}</td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-xs font-semibold inline-block transition-transform duration-200 group-hover:scale-105">
                            {student.classInAdmission || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{student.fatherName || "N/A"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(student)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 hover:rotate-6"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(student)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 hover:-rotate-6"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
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
              <div className="px-4 md:px-6 py-3 bg-gradient-to-r from-gray-50 to-blue-50/50 border-t text-xs text-gray-600 flex justify-between items-center">
                <span className="font-medium">
                  Showing <span className="text-blue-600 font-bold">{filteredStudents.length}</span> of{" "}
                  <span className="text-blue-600 font-bold">{students.length}</span> student(s)
                </span>
                <button
                  onClick={fetchStudents}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-gray-500 text-xs animate-fade-in">
            <p>© 2026 AMC College. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in border border-white/50">
            <div className="bg-gradient-to-r from-[#0a0e0d] to-[#1a2422] px-6 py-4 rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="text-white text-lg font-semibold">Edit Student</h2>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStudent(null);
                }}
                className="text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Full Name" name="name" value={editFormData.name} onChange={handleEditChange} required />
                <FormField label="Date of Birth" name="dateOfBirth" type="date" value={editFormData.dateOfBirth} onChange={handleEditChange} required />
                <FormField label="CNIC / B-Form" name="cnicNo" value={editFormData.cnicNo} onChange={handleEditChange} required placeholder="XXXXX-XXXXXXX-X" />
                <FormField label="Contact Number" name="contactNo" value={editFormData.contactNo} onChange={handleEditChange} required placeholder="03XX-XXXXXXX" />
                <SelectField
                  label="Class"
                  name="classInAdmission"
                  value={editFormData.classInAdmission}
                  onChange={handleEditChange}
                  required
                  options={["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"]}
                />
                <FormField label="Number in Last Class" name="numberInLastClass" value={editFormData.numberInLastClass} onChange={handleEditChange} placeholder="e.g., 45" />
                <FormField label="Roll No of Last Class" name="rollNoOfLastClass" value={editFormData.rollNoOfLastClass} onChange={handleEditChange} placeholder="e.g., 2023-001" />
                <SelectField
                  label="Board of Last Class"
                  name="boardOfLastClass"
                  value={editFormData.boardOfLastClass}
                  onChange={handleEditChange}
                  options={["Punjab Board", "Sindh Board", "KPK Board", "Balochistan Board", "Federal Board", "Other"]}
                />
                <FormField label="Father's Name" name="fatherName" value={editFormData.fatherName} onChange={handleEditChange} required placeholder="Enter father's name" />
                <FormField label="Father's CNIC" name="fatherCnic" value={editFormData.fatherCnic} onChange={handleEditChange} required placeholder="XXXXX-XXXXXXX-X" />
                <div className="md:col-span-2">
                  <FormField label="Father's Contact" name="fatherContact" value={editFormData.fatherContact} onChange={handleEditChange} required placeholder="03XX-XXXXXXX" />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Update Student
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global animations */}
      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 12s infinite ease-in-out; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.5s ease-out both; }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out both; }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.4s ease-out both; }

        @keyframes fade-in-row {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-row { animation: fade-in-row 0.4s ease-out both; }

        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-scale-in { animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
}

/* ---------- Sub Components ---------- */

function StatCard({ label, value, gradient, icon }) {
  return (
    <div className="group relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-5 border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* gradient bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`}></div>
      {/* glow */}
      <div
        className={`absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300 blur-2xl`}
      ></div>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-xs sm:text-sm text-gray-600 font-medium">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 tabular-nums">{value}</p>
        </div>
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, name, value, onChange, type = "text", required, placeholder }) {
  return (
    <div className="group">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black transition-all duration-200 hover:border-blue-400 focus:shadow-lg focus:shadow-blue-100"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, required }) {
  return (
    <div className="group">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black transition-all duration-200 hover:border-blue-400 focus:shadow-lg focus:shadow-blue-100 bg-white"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-3" style={{ animationDelay: `${i * 100}ms` }}>
          <div className="h-10 flex-1 rounded-lg animate-shimmer"></div>
        </div>
      ))}
    </div>
  );
}