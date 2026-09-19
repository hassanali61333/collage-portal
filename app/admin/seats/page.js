// app/seats/page.js
"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  setSeatConfig,
  getSeatAvailability,
  updateSeatConfig,
  deleteSeatConfig,
  getAllAdmissions,
} from "@/app/services/service.js";
import Sidebar from "@/app/components/sidebar.js";

export default function Seats() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [seats, setSeats] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    className: "",
    shift: "",
    totalSeats: "",
  });

  // ─────────────────────────────────────────────
  // FETCH: Admissions
  // ─────────────────────────────────────────────
  const fetchAdmissions = useCallback(async () => {
    try {
      const response = await getAllAdmissions();
      const admissionsData = response?.data?.data || response?.data || [];
      setAdmissions(Array.isArray(admissionsData) ? admissionsData : []);
    } catch (error) {
      console.error("Error fetching admissions:", error);
      setAdmissions([]);
    }
  }, []);

  // ─────────────────────────────────────────────
  // FETCH: Seat Configurations
  // ─────────────────────────────────────────────
  const fetchSeats = useCallback(async () => {
    try {
      const response = await getSeatAvailability();
      const data = response?.data?.data || response?.data || [];
      setSeats(Array.isArray(data) ? data : []);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to load seat configurations. Please try again."
      );
    }
  }, []);

  // ─────────────────────────────────────────────
  // Initial Load
  // ─────────────────────────────────────────────
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchSeats(), fetchAdmissions()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchSeats, fetchAdmissions]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchSeats(), fetchAdmissions()]);
    setLoading(false);
  }, [fetchSeats, fetchAdmissions]);

  // ─────────────────────────────────────────────
  // ✅ Precompute admission counts once → Map: "class|shift" → count
  // ─────────────────────────────────────────────
  const admissionCountMap = useMemo(() => {
    const map = new Map();
    for (const a of admissions) {
      const cls = String(
        a.classInAdmission || a.className || a.class || ""
      ).trim();
      const shift = String(a.shift || "").toLowerCase().trim();
      if (!cls || !shift) continue;
      const key = `${cls}|${shift}`;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [admissions]);

  // ─────────────────────────────────────────────
  // ✅ Memoize enriched seats (only recomputes when data changes)
  // ─────────────────────────────────────────────
  const enrichedSeats = useMemo(() => {
    return seats.map((seat) => {
      const total = Number(seat.totalSeats) || 0;
      const key = `${String(seat.className || "").trim()}|${String(
        seat.shift || ""
      )
        .toLowerCase()
        .trim()}`;
      const filled = admissionCountMap.get(key) || 0;
      const remaining = Math.max(total - filled, 0);
      const percent =
        total > 0 ? Math.min(Math.round((filled / total) * 100), 100) : 0;
      return { ...seat, total, filled, remaining, percent };
    });
  }, [seats, admissionCountMap]);

  // ─────────────────────────────────────────────
  // ✅ Memoize all aggregates in ONE pass
  // ─────────────────────────────────────────────
  const stats = useMemo(() => {
    let totalSeatsSum = 0;
    let totalFilledSum = 0;
    let totalRemainingSum = 0;

    const morning = { total: 0, filled: 0, remaining: 0, count: 0 };
    const evening = { total: 0, filled: 0, remaining: 0, count: 0 };

    for (const s of enrichedSeats) {
      totalSeatsSum += s.total;
      totalFilledSum += s.filled;
      totalRemainingSum += s.remaining;

      const shift = (s.shift || "").toLowerCase();
      const bucket =
        shift === "morning" ? morning : shift === "evening" ? evening : null;
      if (bucket) {
        bucket.total += s.total;
        bucket.filled += s.filled;
        bucket.remaining += s.remaining;
        bucket.count += 1;
      }
    }

    return {
      totalSeatsSum,
      totalFilledSum,
      totalRemainingSum,
      morning,
      evening,
    };
  }, [enrichedSeats]);

  const { totalSeatsSum, totalFilledSum, totalRemainingSum, morning, evening } =
    stats;

  // ─────────────────────────────────────────────
  // Form Handlers
  // ─────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.className) newErrors.className = "Class is required";
    if (!formData.shift) newErrors.shift = "Shift is required";
    if (!formData.totalSeats) {
      newErrors.totalSeats = "Total seats is required";
    } else if (Number(formData.totalSeats) <= 0) {
      newErrors.totalSeats = "Must be greater than 0";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({ className: "", shift: "", totalSeats: "" });
    setEditingId(null);
    setErrors({});
  }, []);

  const openAddModal = useCallback(() => {
    resetForm();
    setShowModal(true);
  }, [resetForm]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    resetForm();
  }, [resetForm]);

  // ─────────────────────────────────────────────
  // ✅ Submit with optimistic updates (no full refetch)
  // ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        className: formData.className,
        shift: formData.shift,
        totalSeats: Number(formData.totalSeats),
      };

      let response;
      if (editingId) {
        response = await updateSeatConfig(payload, editingId);
        // ✅ Update locally instead of refetch
        setSeats((prev) =>
          prev.map((s) => (s._id === editingId ? { ...s, ...payload } : s))
        );
      } else {
        response = await setSeatConfig(payload);
        const newSeat = response?.data?.data || response?.data;
        if (newSeat && newSeat._id) {
          // ✅ Append locally instead of refetch
          setSeats((prev) => [...prev, newSeat]);
        } else {
          // Fallback if backend doesn't return the created item
          fetchSeats();
        }
      }

      const isSuccess =
        response?.data?.success !== false && (response?.status ?? 200) < 400;

      if (isSuccess) {
        closeModal();
      } else {
        alert(response?.data?.message || "Something went wrong!");
        fetchSeats(); // rollback
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          `Error ${editingId ? "updating" : "creating"} seat configuration.`
      );
      fetchSeats(); // rollback
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = useCallback((seat) => {
    setEditingId(seat._id);
    setFormData({
      className: seat.className || "",
      shift: seat.shift || "",
      totalSeats: seat.totalSeats ?? "",
    });
    setErrors({});
    setShowModal(true);
  }, []);

  // ─────────────────────────────────────────────
  // ✅ Delete with optimistic removal
  // ─────────────────────────────────────────────
  const handleDelete = useCallback(
    async (id) => {
      if (!confirm("Are you sure you want to delete this seat configuration?"))
        return;

      // Optimistic removal
      let prevSeats;
      setSeats((prev) => {
        prevSeats = prev;
        return prev.filter((s) => s._id !== id);
      });

      try {
        const response = await deleteSeatConfig(id);
        if ((response?.status ?? 200) >= 400) {
          alert(response?.data?.message || "Failed to delete.");
          setSeats(prevSeats); // rollback
        } else if (editingId === id) {
          resetForm();
        }
      } catch (error) {
        alert(
          error.response?.data?.message ||
            "Error deleting seat configuration. Please try again."
        );
        setSeats(prevSeats); // rollback
      }
    },
    [editingId, resetForm]
  );

  const getShiftBadge = useCallback((shift) => {
    return shift === "morning"
      ? "bg-amber-50 text-amber-700"
      : "bg-indigo-50 text-indigo-700";
  }, []);

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className="w-full md:w-[210px] md:min-w-[210px] flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto w-full max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <div className="flex justify-center items-center gap-3 mb-3">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-black rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white bg-black text-xl md:text-2xl font-bold">
                  A
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                AMC College
              </h1>
            </div>
            <p className="text-sm md:text-base text-gray-600">
              Seat Configuration Management
            </p>
            <div className="w-16 md:w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mt-2 rounded-full"></div>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4">
            <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-600">
              <p className="text-xs text-gray-500 font-medium">Total Seats</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {totalSeatsSum}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-600">
              <p className="text-xs text-gray-500 font-medium">Filled Seats</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {totalFilledSum}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-indigo-600">
              <p className="text-xs text-gray-500 font-medium">
                Remaining Seats
              </p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {totalRemainingSum}
              </p>
            </div>
          </div>

          {/* Shift-wise Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6">
            {/* Morning Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border-t-4 border-amber-500">
              <div className="px-4 py-3 flex items-center justify-between bg-amber-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-800">
                    Morning Shift
                  </h3>
                </div>
                <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
                  {morning.count} config(s)
                </span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-gray-100">
                <div className="p-3 md:p-4 text-center">
                  <p className="text-xs text-gray-500 font-medium">Total</p>
                  <p className="text-lg md:text-xl font-bold text-gray-800 mt-1">
                    {morning.total}
                  </p>
                </div>
                <div className="p-3 md:p-4 text-center">
                  <p className="text-xs text-gray-500 font-medium">Filled</p>
                  <p className="text-lg md:text-xl font-bold text-green-600 mt-1">
                    {morning.filled}
                  </p>
                </div>
                <div className="p-3 md:p-4 text-center">
                  <p className="text-xs text-gray-500 font-medium">
                    Remaining
                  </p>
                  <p className="text-lg md:text-xl font-bold text-indigo-600 mt-1">
                    {morning.remaining}
                  </p>
                </div>
              </div>
            </div>

            {/* Evening Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border-t-4 border-indigo-500">
              <div className="px-4 py-3 flex items-center justify-between bg-indigo-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-800">
                    Evening Shift
                  </h3>
                </div>
                <span className="text-xs text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full font-medium">
                  {evening.count} config(s)
                </span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-gray-100">
                <div className="p-3 md:p-4 text-center">
                  <p className="text-xs text-gray-500 font-medium">Total</p>
                  <p className="text-lg md:text-xl font-bold text-gray-800 mt-1">
                    {evening.total}
                  </p>
                </div>
                <div className="p-3 md:p-4 text-center">
                  <p className="text-xs text-gray-500 font-medium">Filled</p>
                  <p className="text-lg md:text-xl font-bold text-green-600 mt-1">
                    {evening.filled}
                  </p>
                </div>
                <div className="p-3 md:p-4 text-center">
                  <p className="text-xs text-gray-500 font-medium">
                    Remaining
                  </p>
                  <p className="text-lg md:text-xl font-bold text-indigo-600 mt-1">
                    {evening.remaining}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* List Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl overflow-hidden">
            <div className="bg-[#0a0e0d] px-4 md:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-white text-base md:text-lg font-semibold">
                  Seat Configurations
                </h2>
                <p className="text-blue-100 text-xs">
                  Total: {enrichedSeats.length} configuration(s)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={refreshAll}
                  className="px-3 md:px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs md:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    ></path>
                  </svg>
                  Refresh
                </button>

                <button
                  onClick={openAddModal}
                  className="px-3 md:px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs md:text-sm font-semibold rounded-lg transition-all shadow-md flex items-center gap-1.5"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    ></path>
                  </svg>
                  Add Seat
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <svg
                    className="animate-spin h-8 w-8 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p className="mt-3 text-sm text-gray-500">
                    Loading configurations...
                  </p>
                </div>
              ) : enrichedSeats.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      ></path>
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">
                    No seat configurations yet
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Click "Add Seat" to create your first configuration
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Class
                          </th>
                          <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Shift
                          </th>
                          <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Filled
                          </th>
                          <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Remaining
                          </th>
                          <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Occupancy
                          </th>
                          <th className="px-3 md:px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {enrichedSeats.map((seat) => {
                          const { total, filled, remaining, percent } = seat;

                          return (
                            <tr
                              key={seat._id}
                              className="hover:bg-blue-50/50 transition-colors"
                            >
                              <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                                <span className="text-sm font-medium text-gray-800">
                                  {seat.className}
                                </span>
                              </td>
                              <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full capitalize ${getShiftBadge(
                                    seat.shift
                                  )}`}
                                >
                                  {seat.shift}
                                </span>
                              </td>
                              <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                                <span className="text-sm font-semibold text-gray-800">
                                  {total}
                                </span>
                              </td>
                              <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                                <span className="text-sm font-semibold text-green-600">
                                  {filled}
                                </span>
                              </td>
                              <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`text-sm font-semibold ${
                                    remaining > 0
                                      ? "text-indigo-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {remaining}
                                </span>
                              </td>
                              <td className="px-3 md:px-4 py-3 whitespace-nowrap min-w-[140px]">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${
                                        percent >= 90
                                          ? "bg-red-500"
                                          : percent >= 70
                                          ? "bg-amber-500"
                                          : "bg-gradient-to-r from-blue-600 to-indigo-600"
                                      }`}
                                      style={{ width: `${percent}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-600 font-medium w-10 text-right">
                                    {percent}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 md:px-4 py-3 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleEdit(seat)}
                                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                    title="Edit"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      ></path>
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-gray-500 text-xs">
            <p>© 2026 AMC College. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* MODAL POPUP */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#0a0e0d] px-4 md:px-6 py-3 flex items-center justify-between">
              <div>
                <h2 className="text-white text-base md:text-lg font-semibold">
                  {editingId
                    ? "Edit Seat Configuration"
                    : "Add Seat Configuration"}
                </h2>
                <p className="text-blue-100 text-xs">
                  {editingId
                    ? "Update the seat allocation details below"
                    : "Configure total seats per class and shift"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Close"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-4 md:p-6">
              <div className="mb-4">
                <h3 className="text-sm md:text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
                  Seat Allocation Details
                </h3>
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="className"
                      value={formData.className}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.className ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm text-black`}
                    >
                      <option value="">Select Class</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                    </select>
                    {errors.className && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.className}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shift <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="shift"
                      value={formData.shift}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.shift ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm text-black`}
                    >
                      <option value="">Select Shift</option>
                      <option value="morning">Morning</option>
                      <option value="evening">Evening</option>
                    </select>
                    {errors.shift && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.shift}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Seats <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="totalSeats"
                      min="1"
                      value={formData.totalSeats}
                      onChange={handleChange}
                      placeholder="e.g., 50"
                      className={`w-full px-3 py-2 border ${
                        errors.totalSeats ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm text-black`}
                    />
                    {errors.totalSeats && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.totalSeats}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-4 border-t">
                <div className="text-xs text-gray-500">
                  <span className="text-red-500">*</span> Required fields
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {submitting ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {editingId ? "Updating..." : "Saving..."}
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d={
                              editingId
                                ? "M5 13l4 4L19 7"
                                : "M12 4v16m8-8H4"
                            }
                          ></path>
                        </svg>
                        {editingId ? "Update" : "Save"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}