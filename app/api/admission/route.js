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
  const result = await createAdmission(req);

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