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

// ---------- react-icons ----------
import {
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineRefresh,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineViewGrid,
  HiOutlineExclamation,
} from "react-icons/hi";

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
    meritNo: "",
  });

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

    if (
      formData.meritNo !== "" &&
      formData.meritNo !== undefined &&
      formData.meritNo !== null
    ) {
      const m = Number(formData.meritNo);
      if (isNaN(m) || m < 0 || m > 100) {
        newErrors.meritNo = "Merit must be between 0 and 100";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({ className: "", shift: "", totalSeats: "", meritNo: "" });
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

      if (
        formData.meritNo !== "" &&
        formData.meritNo !== undefined &&
        formData.meritNo !== null
      ) {
        payload.meritNo = Number(formData.meritNo);
      }

      let response;
      if (editingId) {
        response = await updateSeatConfig(payload, editingId);
        setSeats((prev) =>
          prev.map((s) => (s._id === editingId ? { ...s, ...payload } : s))
        );
      } else {
        response = await setSeatConfig(payload);
        const newSeat = response?.data?.data || response?.data;
        if (newSeat && newSeat._id) {
          setSeats((prev) => [...prev, newSeat]);
        } else {
          fetchSeats();
        }
      }

      const isSuccess =
        response?.data?.success !== false && (response?.status ?? 200) < 400;

      if (isSuccess) {
        closeModal();
      } else {
        alert(response?.data?.message || "Something went wrong!");
        fetchSeats();
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          `Error ${editingId ? "updating" : "creating"} seat configuration.`
      );
      fetchSeats();
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
      meritNo: seat.meritNo ?? "",
    });
    setErrors({});
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      if (!confirm("Are you sure you want to delete this seat configuration?"))
        return;

      let prevSeats;
      setSeats((prev) => {
        prevSeats = prev;
        return prev.filter((s) => s._id !== id);
      });

      try {
        const response = await deleteSeatConfig(id);
        if ((response?.status ?? 200) >= 400) {
          alert(response?.data?.message || "Failed to delete.");
          setSeats(prevSeats);
        } else if (editingId === id) {
          resetForm();
        }
      } catch (error) {
        alert(
          error.response?.data?.message ||
            "Error deleting seat configuration. Please try again."
        );
        setSeats(prevSeats);
      }
    },
    [editingId, resetForm]
  );

  const getShiftBadge = useCallback((shift) => {
    return shift === "morning"
      ? "bg-orange-50 text-orange-700 border-orange-100"
      : "bg-neutral-100 text-neutral-700 border-neutral-200";
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-neutral-50">
      <div className="w-full md:w-[210px] md:min-w-[210px] flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-10 py-8 md:py-10">

          {/* ---------- HEADER (subtle orange accent) ---------- */}
          <div className="relative bg-white rounded-2xl mb-6 md:mb-8 border border-neutral-200 border-l-4 border-l-orange-500 overflow-hidden">
            <div className="px-6 py-7 md:px-8 md:py-8 flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-orange-100">
                <HiOutlineViewGrid className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-black tracking-tight">
                  Seat Configuration
                </h1>
                <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  Manage class-wise seat allocations per shift
                </p>
              </div>
            </div>
          </div>

          {/* ---------- OVERALL STATS ---------- */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4">
            <StatBox label="Total Seats" value={totalSeatsSum} accent="orange" />
            <StatBox label="Filled Seats" value={totalFilledSum} accent="neutral" />
            <StatBox
              label="Remaining Seats"
              value={totalRemainingSum}
              accent="orange"
            />
          </div>

          {/* ---------- SHIFT BREAKDOWN ---------- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6">
            {/* Morning */}
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden border-t-4 border-t-orange-500">
              <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
                    <HiOutlineSun className="w-4 h-4 text-orange-600" />
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-black">
                    Morning Shift
                  </h3>
                </div>
                <span className="text-[11px] text-orange-700 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full font-semibold">
                  {morning.count} config(s)
                </span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-neutral-100">
                <ShiftCell label="Total" value={morning.total} />
                <ShiftCell label="Filled" value={morning.filled} highlight />
                <ShiftCell label="Remaining" value={morning.remaining} />
              </div>
            </div>

            {/* Evening */}
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden border-t-4 border-t-neutral-800">
              <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                    <HiOutlineMoon className="w-4 h-4 text-neutral-700" />
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-black">
                    Evening Shift
                  </h3>
                </div>
                <span className="text-[11px] text-neutral-700 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-full font-semibold">
                  {evening.count} config(s)
                </span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-neutral-100">
                <ShiftCell label="Total" value={evening.total} />
                <ShiftCell label="Filled" value={evening.filled} highlight />
                <ShiftCell label="Remaining" value={evening.remaining} />
              </div>
            </div>
          </div>

          {/* ---------- LIST ---------- */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="bg-neutral-900 px-5 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-white text-base md:text-lg font-semibold tracking-tight">
                  Seat Configurations
                </h2>
                <p className="text-white/60 text-xs mt-0.5">
                  Total: {enrichedSeats.length} configuration(s)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={refreshAll}
                  className="px-3 md:px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs md:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5"
                >
                  <HiOutlineRefresh className="w-3.5 h-3.5" />
                  Refresh
                </button>

                <button
                  onClick={openAddModal}
                  className="px-3 md:px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs md:text-sm font-semibold rounded-lg transition-all shadow-sm flex items-center gap-1.5"
                >
                  <HiOutlinePlus className="w-3.5 h-3.5" />
                  Add Seat
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full border-2 border-neutral-200" />
                    <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-orange-500 animate-spin" />
                  </div>
                  <p className="mt-3 text-xs text-neutral-500 font-medium">
                    Loading configurations
                  </p>
                </div>
              ) : enrichedSeats.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <HiOutlineViewGrid className="w-8 h-8 text-orange-500" />
                  </div>
                  <p className="text-black text-sm font-semibold">
                    No seat configurations yet
                  </p>
                  <p className="text-neutral-500 text-xs mt-1">
                    Click "Add Seat" to create your first configuration
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="px-3 md:px-4 py-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                            Class
                          </th>
                          <th className="px-3 md:px-4 py-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                            Shift
                          </th>
                          <th className="px-3 md:px-4 py-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-3 md:px-4 py-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                            Filled
                          </th>
                          <th className="px-3 md:px-4 py-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                            Remaining
                          </th>
                          <th className="px-3 md:px-4 py-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                            Merit
                          </th>
                          <th className="px-3 md:px-4 py-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                            Occupancy
                          </th>
                          <th className="px-3 md:px-4 py-3 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {enrichedSeats.map((seat) => {
                          const { total, filled, remaining, percent } = seat;

                          return (
                            <tr
                              key={seat._id}
                              className="hover:bg-orange-50/40 transition-colors"
                            >
                              <td className="px-3 md:px-4 py-3.5 whitespace-nowrap">
                                <span className="text-sm font-semibold text-black">
                                  {seat.className}
                                </span>
                              </td>
                              <td className="px-3 md:px-4 py-3.5 whitespace-nowrap">
                                <span
                                  className={`text-[11px] px-2.5 py-1 rounded-full capitalize font-semibold border ${getShiftBadge(
                                    seat.shift
                                  )}`}
                                >
                                  {seat.shift}
                                </span>
                              </td>
                              <td className="px-3 md:px-4 py-3.5 whitespace-nowrap">
                                <span className="text-sm font-semibold text-black">
                                  {total}
                                </span>
                              </td>
                              <td className="px-3 md:px-4 py-3.5 whitespace-nowrap">
                                <span className="text-sm font-semibold text-orange-600">
                                  {filled}
                                </span>
                              </td>
                              <td className="px-3 md:px-4 py-3.5 whitespace-nowrap">
                                <span
                                  className={`text-sm font-semibold ${
                                    remaining > 0
                                      ? "text-black"
                                      : "text-neutral-400"
                                  }`}
                                >
                                  {remaining}
                                </span>
                              </td>
                              <td className="px-3 md:px-4 py-3.5 whitespace-nowrap">
                                <span className="text-sm font-medium text-neutral-700">
                                  {seat.meritNo !== null &&
                                  seat.meritNo !== undefined
                                    ? seat.meritNo
                                    : "—"}
                                  %
                                </span>
                              </td>
                              <td className="px-3 md:px-4 py-3.5 whitespace-nowrap min-w-[140px]">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        percent >= 90
                                          ? "bg-neutral-900"
                                          : percent >= 70
                                          ? "bg-orange-600"
                                          : "bg-orange-400"
                                      }`}
                                      style={{ width: `${percent}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-neutral-600 font-medium w-10 text-right tabular-nums">
                                    {percent}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 md:px-4 py-3.5 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleEdit(seat)}
                                    className="p-1.5 text-orange-600 hover:bg-orange-600 hover:text-white rounded-lg transition-all duration-200"
                                    title="Edit"
                                  >
                                    <HiOutlinePencil className="w-4 h-4" />
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

          <div className="text-center mt-10">
            <p className="text-xs text-neutral-400 font-medium">
              © 2026 AMC College
            </p>
          </div>
        </div>
      </div>

      {/* ---------- MODAL ---------- */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-neutral-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
                  {editingId ? (
                    <HiOutlinePencil className="w-4 h-4 text-orange-600" />
                  ) : (
                    <HiOutlinePlus className="w-4 h-4 text-orange-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-black text-sm md:text-base font-semibold tracking-tight">
                    {editingId
                      ? "Edit Seat Configuration"
                      : "Add Seat Configuration"}
                  </h2>
                  <p className="text-neutral-500 text-[11px]">
                    {editingId
                      ? "Update the seat allocation details"
                      : "Configure total seats per class and shift"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-neutral-400 hover:text-black hover:bg-neutral-100 transition-all p-1.5 rounded-lg"
                title="Close"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">

                <FieldWrap label="Class" required>
                  <select
                    name="className"
                    value={formData.className}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 bg-neutral-50 border ${
                      errors.className
                        ? "border-neutral-900"
                        : "border-neutral-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    } rounded-lg text-sm text-black font-medium focus:outline-none focus:bg-white transition-all`}
                  >
                    <option value="">Select Class</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                  {errors.className && (
                    <p className="text-black text-[11px] mt-1.5 font-semibold flex items-center gap-1">
                      <HiOutlineExclamation className="w-3 h-3" />
                      {errors.className}
                    </p>
                  )}
                </FieldWrap>

                <FieldWrap label="Shift" required>
                  <select
                    name="shift"
                    value={formData.shift}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 bg-neutral-50 border ${
                      errors.shift
                        ? "border-neutral-900"
                        : "border-neutral-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    } rounded-lg text-sm text-black font-medium focus:outline-none focus:bg-white transition-all capitalize`}
                  >
                    <option value="">Select Shift</option>
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                  </select>
                  {errors.shift && (
                    <p className="text-black text-[11px] mt-1.5 font-semibold flex items-center gap-1">
                      <HiOutlineExclamation className="w-3 h-3" />
                      {errors.shift}
                    </p>
                  )}
                </FieldWrap>

                <FieldWrap label="Total Seats" required>
                  <input
                    type="number"
                    name="totalSeats"
                    min="1"
                    value={formData.totalSeats}
                    onChange={handleChange}
                    placeholder="e.g., 50"
                    className={`w-full px-3.5 py-2.5 bg-neutral-50 border ${
                      errors.totalSeats
                        ? "border-neutral-900"
                        : "border-neutral-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    } rounded-lg text-sm text-black font-medium focus:outline-none focus:bg-white transition-all`}
                  />
                  {errors.totalSeats && (
                    <p className="text-black text-[11px] mt-1.5 font-semibold flex items-center gap-1">
                      <HiOutlineExclamation className="w-3 h-3" />
                      {errors.totalSeats}
                    </p>
                  )}
                </FieldWrap>

                <FieldWrap
                  label="Merit No"
                  hint="optional, 0–100"
                >
                  <input
                    type="number"
                    name="meritNo"
                    min="0"
                    max="100"
                    value={formData.meritNo}
                    onChange={handleChange}
                    placeholder="e.g., 75"
                    className={`w-full px-3.5 py-2.5 bg-neutral-50 border ${
                      errors.meritNo
                        ? "border-neutral-900"
                        : "border-neutral-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    } rounded-lg text-sm text-black font-medium focus:outline-none focus:bg-white transition-all`}
                  />
                  {errors.meritNo && (
                    <p className="text-black text-[11px] mt-1.5 font-semibold flex items-center gap-1">
                      <HiOutlineExclamation className="w-3 h-3" />
                      {errors.meritNo}
                    </p>
                  )}
                </FieldWrap>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-5 mt-5 border-t border-neutral-100">
                <div className="text-[11px] text-neutral-500 font-medium">
                  <span className="text-orange-600 font-bold">*</span> Required
                  fields
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black font-semibold rounded-lg transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 sm:flex-none px-5 md:px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-sm"
                  >
                    {submitting ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {editingId ? "Updating..." : "Saving..."}
                      </>
                    ) : (
                      <>
                        {editingId ? (
                          <>
                            <HiOutlineCheck className="w-4 h-4" />
                            Update
                          </>
                        ) : (
                          <>
                            <HiOutlinePlus className="w-4 h-4" />
                            Save
                          </>
                        )}
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

/* ---------- Sub components ---------- */

function StatBox({ label, value, accent = "orange" }) {
  const isOrange = accent === "orange";
  return (
    <div
      className={`bg-white rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 ${
        isOrange
          ? "border-neutral-200 border-l-4 border-l-orange-500"
          : "border-neutral-200"
      }`}
    >
      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-2xl font-bold text-black mt-1.5 tabular-nums">
        {value}
      </p>
    </div>
  );
}

function ShiftCell({ label, value, highlight = false }) {
  return (
    <div className="p-3 md:p-4 text-center">
      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`text-lg md:text-xl font-bold mt-1 tabular-nums ${
          highlight ? "text-orange-600" : "text-black"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function FieldWrap({ label, hint, required, children }) {
  return (
    <div>
      <label className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">
          {label} {required && <span className="text-orange-600">*</span>}
        </span>
        {hint && (
          <span className="text-[10px] text-neutral-400 font-medium">
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}