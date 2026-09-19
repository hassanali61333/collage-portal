"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
// import Sidebar from "@/app/components/sidebar";
import { useSelector } from "react-redux";
import { 
  getAllAdmissions,
  updateAdmissionByStudentId, 
  deleteAdmissionByStudentId 
} from "@/app/services/service.js";

export default function AdminDashboard() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
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

  // Memoized stats calculations
  const stats = useMemo(() => {
    const activeAdmissions = students.filter(s => s.classInAdmission).length;
    const uniqueClasses = new Set(students.map(s => s.classInAdmission).filter(Boolean)).size;
    return { total: students.length, active: activeAdmissions, classes: uniqueClasses };
  }, [students]);

  // Fetch students with optimized error handling
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

  // Initial fetch
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Handle Edit
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

  // Handle Edit Form Change
  const handleEditChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Handle Edit Submit
  const handleEditSubmit = useCallback(async (e) => {
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
  }, [editingStudent, editFormData, fetchStudents]);

  // Handle Delete
  const handleDelete = useCallback(async (student) => {
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
  }, [fetchStudents]);

  // Navigate to Add Admission
  const handleAddNew = useCallback(() => {
    router.push("/admin/students");
  }, [router]);

  return (
    <div className="flex  flex-col  md:flex-row min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className="w-full md:w-[210px] md:min-w-[210px] flex-shrink-0">
        {/* <Sidebar /> */}
      </div>
      
  

   
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto w-full max-w-5xl mx-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Student Management</h1>
              <p className="text-sm text-gray-600 mt-1">View and manage all student admissions</p>
            </div>
            <button
              onClick={handleAddNew}
              className="px-4 md:px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Add New Student
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-200">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Students</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-200">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Active Admissions</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{stats.active}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 border-l-4 border-purple-500 hover:shadow-lg transition-shadow duration-200">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Classes</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{stats.classes}</p>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              {loading && students.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No students found</p>
                  <button
                    onClick={handleAddNew}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Add First Student
                  </button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-[#0a0e0d] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Student ID</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left hidden md:table-cell">CNIC</th>
                      <th className="px-4 py-3 text-left hidden lg:table-cell">Contact</th>
                      <th className="px-4 py-3 text-left">Class</th>
                      <th className="px-4 py-3 text-left hidden sm:table-cell">Father's Name</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((student, index) => (
                      <tr key={student.studentId || student.id || index} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {student.studentId || student.id || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{student.name || "N/A"}</td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{student.cnicNo || "N/A"}</td>
                        <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{student.contactNo || "N/A"}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {student.classInAdmission || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{student.fatherName || "N/A"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(student)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(student)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
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
            {students.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 border-t text-xs text-gray-500 flex justify-between items-center">
                <span>Showing {students.length} student(s)</span>
                <button
                  onClick={fetchStudents}
                  className="text-blue-600 hover:text-blue-800 transition"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-gray-500 text-xs">
            <p>© 2026 AMC College. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-[#0a0e0d] px-6 py-4 rounded-t-xl flex justify-between items-center">
              <h2 className="text-white text-lg font-semibold">Edit Student</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStudent(null);
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={editFormData.dateOfBirth}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNIC / B-Form *</label>
                  <input
                    type="text"
                    name="cnicNo"
                    value={editFormData.cnicNo}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                    placeholder="XXXXX-XXXXXXX-X"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                  <input
                    type="text"
                    name="contactNo"
                    value={editFormData.contactNo}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                    placeholder="03XX-XXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                  <select
                    name="classInAdmission"
                    value={editFormData.classInAdmission}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                  >
                    <option value="">Select Class</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number in Last Class</label>
                  <input
                    type="text"
                    name="numberInLastClass"
                    value={editFormData.numberInLastClass}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                    placeholder="e.g., 45"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Roll No of Last Class</label>
                  <input
                    type="text"
                    name="rollNoOfLastClass"
                    value={editFormData.rollNoOfLastClass}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                    placeholder="e.g., 2023-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Board of Last Class</label>
                  <select
                    name="boardOfLastClass"
                    value={editFormData.boardOfLastClass}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                  >
                    <option value="">Select Board</option>
                    <option value="Punjab Board">Punjab Board</option>
                    <option value="Sindh Board">Sindh Board</option>
                    <option value="KPK Board">KPK Board</option>
                    <option value="Balochistan Board">Balochistan Board</option>
                    <option value="Federal Board">Federal Board</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name *</label>
                  <input
                    type="text"
                    name="fatherName"
                    value={editFormData.fatherName}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                    placeholder="Enter father's name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Father's CNIC *</label>
                  <input
                    type="text"
                    name="fatherCnic"
                    value={editFormData.fatherCnic}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                    placeholder="XXXXX-XXXXXXX-X"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Father's Contact *</label>
                  <input
                    type="text"
                    name="fatherContact"
                    value={editFormData.fatherContact}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                    placeholder="03XX-XXXXXXX"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    "Update Student"
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