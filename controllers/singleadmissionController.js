import connectDB from "@/lib/db"
import AdmissionModel from "../models/admissionModel.js";

export async function getadmissionbyid(params) {
  try {
    await connectDB();

    const { studentId } = params;

    if (!studentId) {
      return {
        success: false,
        message: "studentId is required",
        status: 400,
        data: null,
      };
    }

    const found = await AdmissionModel.findOne({studentId:studentId});

    if (found === null) {
      return {
        success: false,
        message: "student not found",
        status: 404,
        data: null,
      };
    }

    return {
      success: true,
      message: "student get successfully",
      status: 200,
      data: found,
    };

  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: "something went wrong",
      status: 500,
      data: null,
    };
  }
}