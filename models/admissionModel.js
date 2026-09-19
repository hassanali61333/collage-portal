// models/Admission.js
import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      unique: true,
      required: [true, "Student ID is required"],
    },
    image: {
      type: String, // stores the image URL / file path
    },
    shift: {
      type: String,
      enum: ["morning", "evening"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    cnicNo: {
      type: String,
      required: [true, "CNIC / B-Form number is required"],
      trim: true,
      unique: true,
    },
    picture: {
      type: String, // stores the image URL / file path
      default: null,
    },
    contactNo: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
    },
    classInAdmission: {
      type: String,
      required: [true, "Class applying for admission in is required"],
      trim: true,
    },
    numberInLastClass: {
      type: String,
      trim: true,
    },
    rollNoOfLastClass: {
      type: String,
      trim: true,
    },
    boardOfLastClass: {
      type: String,
      trim: true,
    },
    fatherName: {
      type: String,
      required: [true, "Father's name is required"],
      trim: true,
    },
    fatherCnic: {
      type: String,
      required: [true, "Father's CNIC is required"],
      trim: true,
    },
    fatherContact: {
      type: String,
      required: [true, "Father's contact number is required"],
      trim: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const AdmissionModel =
  mongoose.models.Admission || mongoose.model("Admission", admissionSchema);

export default AdmissionModel;