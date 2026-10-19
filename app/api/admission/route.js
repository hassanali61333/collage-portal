// app/api/admission/route.js
import { NextResponse } from "next/server";
import {
  getAllAdmissions,
  createAdmission,
  updateAdmissionByStudentId,
  deleteAdmissionByStudentId,
} from "@/controllers/admissionController";

// ============================================
// GET - Get all admissions
// ============================================
export async function GET() {
  const result = await getAllAdmissions();

  return NextResponse.json(
    {
      success: result.success,
      message: result.message,
      data: result.data || null,
    },
    {
      status: result.status,
    }
  );
}

// ============================================
// POST - Create new admission
// ============================================


export async function POST(req) {
  try {
    // 1. Request se JSON data nikaalein
    const body = await req.json();

    // 2. createAdmission ko req nahi, body bhejein
    const result = await createAdmission(body);

    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        data: result.data || null,
      },
      {
        status: result.status || 200,
      }
    );
  } catch (error) {
    console.error("Route Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        data: null,
      },
      {
        status: 500,
      }
    );
  }
}
// ============================================
// PUT - Update admission by Student ID (using query param)
// ============================================
export async function PUT(req) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
  
  const result = await updateAdmissionByStudentId(req, { studentId });

  return NextResponse.json(
    {
      success: result.success,
      message: result.message,
      data: result.data || null,
    },
    {
      status: result.status,
    }
  );
}

// ============================================
// DELETE - Delete admission by Student ID (using query param)
// ============================================
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
  
  const result = await deleteAdmissionByStudentId({ studentId });

  return NextResponse.json(
    {
      success: result.success,
      message: result.message,
      data: result.data || null,
    },
    {
      status: result.status,
    }
  );
}