"use client";
import { useState, useEffect } from "react";
import {
  getAdmissionSettings,
  createAdmissionSetting,
  updateAdmissionSetting,
  deleteAdmissionSetting,
} from "@/app/services/service.js";
import Sidebar from "@/app/components/sidebar.js";

// ---------- react-icons ----------
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineDocumentText,
  HiOutlineClipboardList,
  HiOutlineExclamation,
} from "react-icons/hi";

const EMPTY_FORM = {
  className: "",
  admissionOpenUntil: "",
  meritListDate: "",
  academicYear: "",
  shift: "Both",
  isMeritListPublished: false,
};

export default function AdmissionSettingsAdmin() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deletingId, setDeletingId] = useState(null);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await getAdmissionSettings();
      const data = res?.data?.data || [];
      setSettings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load admission settings:", err);
      setError("Failed to load admission settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const toDateInput = (val) => (val ? String(val).slice(0, 10) : "");

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (setting) => {
    setEditingId(setting._id);
    setForm({
      className: setting.className || "",
      admissionOpenUntil: toDateInput(setting.admissionOpenUntil),
      meritListDate: toDateInput(setting.meritListDate),
      academicYear: setting.academicYear || "",
      shift: setting.shift || "Both",
      isMeritListPublished: !!setting.isMeritListPublished,
    });
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.className || !form.admissionOpenUntil || !form.meritListDate) {
      setError(
        "Class name, admission close date aur merit list date required hain"
      );
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateAdmissionSetting(editingId, form);
      } else {
        await createAdmissionSetting(form);
      }

      closeForm();
      await loadSettings();
    } catch (err) {
      console.error("Save failed:", err);
      setError(
        err?.response?.data?.message || "Save failed. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Kya aap is record ko delete karna chahte hain?")) return;
    setDeletingId(id);
    try {
      await deleteAdmissionSetting(id);
      await loadSettings();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (val) => {
    if (!val) return "—";
    const d = new Date(val);
    return isNaN(d) ? "—" : d.toLocaleDateString("en-GB");
  };

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
                  <HiOutlineDocumentText className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold text-black tracking-tight">
                    Admission Settings
                  </h1>
                  <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    Class-wise admission close date & merit list date
                  </p>
                </div>
              </div>

              <button
                onClick={openCreateForm}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 active:scale-[0.98] transition-all duration-200 shadow-sm self-start sm:self-auto"
              >
                <HiOutlinePlus className="w-4 h-4" />
                Add Setting
              </button>
            </div>
          </div>

          {/* ---------- LOADING / EMPTY / TABLE ---------- */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl animate-pulse bg-white border border-neutral-200"
                />
              ))}
            </div>
          ) : settings.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-2xl py-16 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-5">
                <HiOutlineClipboardList className="w-8 h-8 text-orange-500" />
              </div>
              <p className="text-black text-base font-semibold tracking-tight mb-1">
                Koi admission setting nahi mili
              </p>
              <p className="text-neutral-500 text-sm mb-6">
                Naya record add karke start karein
              </p>
              <button
                onClick={openCreateForm}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 active:scale-[0.98] transition-all"
              >
                <HiOutlinePlus className="w-4 h-4" />
                Add Setting
              </button>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                        Academic Year
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                        Admission Until
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                        Merit List Date
                      </th>
                      <th className="px-4 py-3 text-center text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                        Published
                      </th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {settings.map((s) => (
                      <tr
                        key={s._id}
                        className="hover:bg-orange-50/40 transition-colors"
                      >
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-black">
                            {s.className}
                          </div>
                          <div className="text-xs text-neutral-500 mt-0.5">
                            {s.shift || "Both"}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-neutral-500">
                          {s.academicYear || "—"}
                        </td>
                        <td className="px-4 py-3.5 text-neutral-700">
                          {formatDate(s.admissionOpenUntil)}
                        </td>
                        <td className="px-4 py-3.5 text-black font-medium">
                          {formatDate(s.meritListDate)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                              s.isMeritListPublished
                                ? "bg-orange-600 text-white border-orange-600"
                                : "bg-white text-neutral-500 border-neutral-200"
                            }`}
                          >
                            {s.isMeritListPublished ? "Published" : "Pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => openEditForm(s)}
                              title="Edit"
                              className="p-2 text-orange-600 hover:bg-orange-600 hover:text-white rounded-lg transition-all duration-200"
                            >
                              <HiOutlinePencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(s._id)}
                              disabled={deletingId === s._id}
                              title="Delete"
                              className="p-2 text-neutral-600 hover:bg-neutral-800 hover:text-white rounded-lg transition-all duration-200 disabled:opacity-50"
                            >
                              {deletingId === s._id ? (
                                <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <HiOutlineTrash className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="text-center mt-10">
            <p className="text-xs text-neutral-400 font-medium">
              © 2026 AMC College
            </p>
          </div>
        </div>
      </div>

      {/* ---------- Add/Edit Modal ---------- */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeForm}
        >
          <div
            className="bg-white rounded-2xl border border-neutral-200 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
                  {editingId ? (
                    <HiOutlinePencil className="w-4 h-4 text-orange-600" />
                  ) : (
                    <HiOutlinePlus className="w-4 h-4 text-orange-600" />
                  )}
                </div>
                <h2 className="font-semibold text-black tracking-tight">
                  {editingId ? "Edit Setting" : "Add Setting"}
                </h2>
              </div>
              <button
                onClick={closeForm}
                aria-label="Close"
                className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-all duration-200"
              >
                <HiOutlineX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-100 rounded-lg text-sm text-black font-medium">
                  <HiOutlineExclamation className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-600" />
                  <span>{error}</span>
                </div>
              )}

              <Field label="Class Name" required>
                <input
                  type="text"
                  name="className"
                  value={form.className}
                  onChange={handleChange}
                  placeholder="Class 11"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-black font-medium placeholder-neutral-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:bg-white transition-all"
                  required
                />
              </Field>

              <Field label="Academic Year">
                <input
                  type="text"
                  name="academicYear"
                  value={form.academicYear}
                  onChange={handleChange}
                  placeholder="2026-2027"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-black font-medium placeholder-neutral-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:bg-white transition-all"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Admission Open Until" required>
                  <input
                    type="date"
                    name="admissionOpenUntil"
                    value={form.admissionOpenUntil}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-black font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:bg-white transition-all"
                    required
                  />
                </Field>
                <Field label="Merit List Date" required>
                  <input
                    type="date"
                    name="meritListDate"
                    value={form.meritListDate}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-black font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:bg-white transition-all"
                    required
                  />
                </Field>
              </div>

              <Field label="Shift">
                <select
                  name="shift"
                  value={form.shift}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-black font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:bg-white transition-all"
                >
                  <option value="Both">Both</option>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                </select>
              </Field>

              <label className="flex items-center gap-2.5 text-sm text-black cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isMeritListPublished"
                  checked={form.isMeritListPublished}
                  onChange={handleChange}
                  className="w-4 h-4 rounded accent-orange-600"
                />
                <span className="font-medium">Merit list published?</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                >
                  {saving ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <HiOutlineCheck className="w-4 h-4" />
                      {editingId ? "Update" : "Create"}
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

/* ---------------- Field Wrapper ---------------- */
function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-orange-600">*</span>}
      </label>
      {children}
    </div>
  );
}