import mongoose from "mongoose";
import connectDB from "@/lib/db.js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      message: "✅ Database connected!",
      database: mongoose.connection.name, // ya mongoose.connection.db.databaseName
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}