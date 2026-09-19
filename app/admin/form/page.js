// app/admission/page.js
"use client";
import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAdmission } from "@/app/services/service.js";
import Sidebar from "@/app/components/sidebar";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/app/redux/authSlice";

export default function Form() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
const dispatch=useDispatch()
  const auth = useSelector((state) => state.auth.user);
console.log("myid")

  useEffect(() => {
    if (!auth) {
      const data = localStorage.getItem("user");
      if (data) {
        const parsedData = JSON.parse(data);
        dispatch(loginUser(parsedData));
      }
    }
  }, [auth, dispatch]);
  const stuid=auth?.id;
  const [formData, setFormData] = useState({
    studentId: stuid,

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
    picture: null,
  });



  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      picture: e.target.files[0],
    }));
    if (errors.picture) {
      setErrors((prev) => ({
        ...prev,
        picture: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.cnicNo) newErrors.cnicNo = "CNIC number is required";
    if (!formData.contactNo) newErrors.contactNo = "Contact number is required";
    if (!formData.classInAdmission) newErrors.classInAdmission = "Class is required";
    if (!formData.fatherName) newErrors.fatherName = "Father's name is required";
    if (!formData.fatherCnic) newErrors.fatherCnic = "Father's CNIC is required";
    if (!formData.fatherContact) newErrors.fatherContact = "Father's contact is required";
    if (!formData.shift) newErrors.shift = "Shift is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key]);
        }
      });

      const response = await createAdmission(submitData);

      if (response.data.success) {
        alert("Admission application submitted successfully!");
        router.push("/dashboard");
      } else {
        alert(response.data.message || "Something went wrong!");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Error submitting form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sidebar - fixed width 210px on desktop, full width on mobile */}
      <div className="w-full md:w-[210px] md:min-w-[210px] flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content - takes remaining space */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <div className="flex justify-center items-center gap-3 mb-3">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-black rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white bg-black text-xl md:text-2xl font-bold">A</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">AMC College</h1>
            </div>
            <p className="text-sm md:text-base text-gray-600">Admission Form 2026</p>
            <div className="w-16 md:w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mt-2 rounded-full"></div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl overflow-hidden">
            <div className="bg-[#0a0e0d] px-4 md:px-6 py-3">
              <h2 className="text-white text-base md:text-lg font-semibold">Student Information</h2>
              <p className="text-blue-100 text-xs">Please fill all required fields (*)</p>
            </div>

            <form onSubmit={handleSubmit} className="p-4 md:p-6">
              {/* Personal Information Section */}
              <div className="mb-6">
                <h3 className="text-sm md:text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm text-black`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm text-black`}
                    />
                    {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CNIC / B-Form <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="cnicNo"
                      value={formData.cnicNo}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.cnicNo ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm text-black`}
                      placeholder="XXXXX-XXXXXXX-X"
                    />
                    {errors.cnicNo && <p className="text-red-500 text-xs mt-1">{errors.cnicNo}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactNo"
                      value={formData.contactNo}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.contactNo ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm text-black`}
                      placeholder="03XX-XXXXXXX"
                    />
                    {errors.contactNo && <p className="text-red-500 text-xs mt-1">{errors.contactNo}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shift <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="shift"
                      value={formData.shift}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.shift ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm text-black`}
                    >
                      <option value="">Select Shift</option>
                      <option value="morning">Morning</option>
                      <option value="evening">Evening</option>
                    </select>
                    {errors.shift && <p className="text-red-500 text-xs mt-1">{errors.shift}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Picture
                    </label>
                    <input
                      type="file"
                      name="picture"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm text-black file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 file:text-xs"
                    />
                    {errors.picture && <p className="text-red-500 text-xs mt-1">{errors.picture}</p>}
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="mb-6">
                <h3 className="text-sm md:text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-green-600 rounded-full"></span>
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Applying for Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="classInAdmission"
                      value={formData.classInAdmission}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.classInAdmission ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm text-black`}
                    >
                      <option value="">Select Class</option>

                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                    </select>
                    {errors.classInAdmission && <p className="text-red-500 text-xs mt-1">{errors.classInAdmission}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number in Last Class
                    </label>
                    <input
                      type="text"
                      name="numberInLastClass"
                      value={formData.numberInLastClass}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm text-black"
                      placeholder="e.g., 45"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Roll No of Last Class
                    </label>
                    <input
                      type="text"
                      name="rollNoOfLastClass"
                      value={formData.rollNoOfLastClass}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm text-black"
                      placeholder="e.g., 2023-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Board of Last Class
                    </label>
                    <select
                      name="boardOfLastClass"
                      value={formData.boardOfLastClass}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm text-black"
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
                </div>
              </div>

              {/* Father Information */}
              <div className="mb-6">
                <h3 className="text-sm md:text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-purple-600 rounded-full"></span>
                  Father/Guardian Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Father's Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.fatherName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm text-black`}
                      placeholder="Enter father's name"
                    />
                    {errors.fatherName && <p className="text-red-500 text-xs mt-1">{errors.fatherName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Father's CNIC <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fatherCnic"
                      value={formData.fatherCnic}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.fatherCnic ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm text-black`}
                      placeholder="XXXXX-XXXXXXX-X"
                    />
                    {errors.fatherCnic && <p className="text-red-500 text-xs mt-1">{errors.fatherCnic}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Father's Contact <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fatherContact"
                      value={formData.fatherContact}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.fatherContact ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm text-black`}
                      placeholder="03XX-XXXXXXX"
                    />
                    {errors.fatherContact && <p className="text-red-500 text-xs mt-1">{errors.fatherContact}</p>}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-between items-center pt-4 border-t">
                <div className="text-xs text-gray-500">
                  <span className="text-red-500">*</span> Required fields
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-4 md:px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-gray-500 text-xs">
            <p>© 2026 AMC College. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}