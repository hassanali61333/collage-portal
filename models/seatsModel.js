// models/SeatConfig.js
import mongoose from "mongoose";

const seatConfigSchema = new mongoose.Schema({
  className: { type: String, required: true }, // e.g. "Class 7"
  shift: { type: String, enum: ["Morning", "Evening"], required: true },
  totalSeats: { type: Number, required: true },
}, { timestamps: true });

seatConfigSchema.index({ className: 1, shift: 1 }, { unique: true });
const SeatConfig = mongoose.model("SeatConfig", seatConfigSchema);
export default SeatConfig;