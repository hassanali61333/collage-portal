// models/notificationModel.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// ✅ SAFE: reuse existing model if already compiled (fixes OverwriteModelError)
const notificatonModel =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default notificatonModel;