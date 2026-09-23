// models/SeatConfig.js
import mongoose from "mongoose";

const seatConfigSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
    },
    shift: {
      type: String,
      enum: ["morning", "evening"], // ✅ lowercase
      required: true,
      trim: true,
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 0,
    },
    meritNo: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

seatConfigSchema.index({ className: 1, shift: 1 }, { unique: true });

const SeatConfig =
  mongoose.models.SeatConfig ||
  mongoose.model("SeatConfig", seatConfigSchema);

export default SeatConfig;