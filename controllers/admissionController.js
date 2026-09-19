// controllers/admissionController.js
import AdmissionModel from "../models/admissionModel.js";
import connectDB from "../lib/db.js";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// ============================================
// GET - Get all admissions
// ============================================
export async function getAllAdmissions() {
  try {
    await connectDB();
    const admissions = await AdmissionModel.find({}).sort({ createdAt: -1 });

    return {
      success: true,
      message: "Admissions fetched successfully",
      data: admissions,
      status: 200,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: null,
      status: 500,
    };
  }
}

// ============================================
// POST - Create admission (with picture + shift support)
// ============================================
export async function createAdmission(req) {
  try {
    await connectDB();

    const formData = await req.formData();

    // Convert formData entries into a plain object (skip picture, handled separately)
    const admissionData = {};
    for (const [key, value] of formData.entries()) {
      if (key !== "picture") {
        admissionData[key] = value;
      }
    }

    // Handle picture upload (if provided)
    const pictureFile = formData.get("picture");
    if (pictureFile && typeof pictureFile === "object" && pictureFile.size > 0) {
      const bytes = await pictureFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const fileName = `${Date.now()}-${pictureFile.name}`;
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);

      admissionData.picture = `/uploads/${fileName}`;
    }

    // Check if CNIC already exists
    const existingAdmission = await AdmissionModel.findOne({
      cnicNo: admissionData.cnicNo,
    });

    if (existingAdmission) {
      return {
        success: false,
        message: "CNIC/B-Form number already registered",
        data: null,
        status: 400,
      };
    }

    const admission = await AdmissionModel.create(admissionData);

    return {
      success: true,
      message: "Admission created successfully",
      data: admission,
      status: 201,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: null,
      status: 500,
    };
  }
}

// ============================================
// PUT - Update admission by Student ID
// ============================================
export async function updateAdmissionByStudentId(req, params) {
  try {
    await connectDB();
    const { studentId } = params; // This is Student ID (STU-YYYY-XXXXX)
    const updateData = await req.json();

    if (!studentId) {
      return {
        success: false,
        message: "Student ID is required",
        data: null,
        status: 400,
      };
    }

    // Remove studentId from update to prevent manual changes
    delete updateData.studentId;

    const admission = await AdmissionModel.findOneAndUpdate(
      { studentId }, // Finding by Student ID
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!admission) {
      return {
        success: false,
        message: "Admission not found with this Student ID",
        data: null,
        status: 404,
      };
    }

    return {
      success: true,
      message: "Admission updated successfully",
      data: admission,
      status: 200,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: null,
      status: 500,
    };
  }
}

// ============================================
// DELETE - Delete admission by Student ID
// ============================================
export async function deleteAdmissionByStudentId(params) {
  try {
    await connectDB();
    const { studentId } = params; // This is Student ID (STU-YYYY-XXXXX)

    if (!studentId) {
      return {
        success: false,
        message: "Student ID is required",
        data: null,
        status: 400,
      };
    }

    const admission = await AdmissionModel.findOneAndDelete({ studentId });

    if (!admission) {
      return {
        success: false,
        message: "Admission not found with this Student ID",
        data: null,
        status: 404,
      };
    }

    return {
      success: true,
      message: "Admission deleted successfully",
      data: null,
      status: 200,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: null,
      status: 500,
    };
  }
}