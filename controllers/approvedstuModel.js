import connectDB from "@/lib/db.js";
import AdmissionModel from "@/models/admissionModel";
import { NextResponse } from "next/server";

const getapprovedstudent = async () => {
  try {
    await connectDB();

    const data = await AdmissionModel.find();

    const approvedStudents = data.filter(
      (student) => student.status === "approved"
    );

    return NextResponse.json({
      success: true,
      data: approvedStudents,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get students",
      },
      { status: 500 }
    );
  }
};

export default getapprovedstudent;