import mongoose from "mongoose";

const AdmissionSettingSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
      // e.g. "Class 11", "Class 12"
    },
    admissionOpenUntil: {
      type: Date,
      required: [true, "Admission closing date is required"],
    },
    meritListDate: {
      type: Date,
      required: [true, "Merit list date is required"],
    },
    academicYear: {
      type: String,
      trim: true,
      default: () =>
        `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    },
    shift: {
      type: String,
      enum: ["Morning", "Evening", "Both"],
      default: "Both",
    },
    isMeritListPublished: {
      type: Boolean,
      default: false,
      // frontend can use this to decide: show merit table vs "coming on <date>"
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate active entries for the same class + year
AdmissionSettingSchema.index(
  { className: 1, academicYear: 1 },
  { unique: true }
);

export default mongoose.models.AdmissionSetting ||
  mongoose.model("AdmissionSetting", AdmissionSettingSchema);