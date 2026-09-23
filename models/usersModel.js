import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

  isFormFill: { 
    type: Boolean,
     default: false 
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model("User", userSchema);