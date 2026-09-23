import { NextResponse } from "next/server";
import connectDB from "@/lib/db.js"; // 👈 apni actual db connect utility ka path daalein
import AdmissionSetting from "@/models/datesinfoModel.js";

// GET /api/admission-settings
// GET /api/admission-settings?id=xxxx                          -> single record
// GET /api/admission-settings?className=Class 11               -> filtered list
// GET /api/admission-settings?className=Class 11&shift=Morning -> filtered list
export async function getAdmissionSettings(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // single record by id
    if (id) {
      const setting = await AdmissionSetting.findById(id);
      if (!setting) {
        return NextResponse.json(
          { success: false, message: "Admission setting not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, data: setting },
        { status: 200 }
      );
    }

    // list, optionally filtered
    const className = searchParams.get("className");
    const academicYear = searchParams.get("academicYear");
    const shift = searchParams.get("shift");
    const isMeritListPublished = searchParams.get("isMeritListPublished");

    const filter = { isActive: true };
    if (className) filter.className = className;
    if (academicYear) filter.academicYear = academicYear;
    if (shift) filter.shift = shift;
    if (isMeritListPublished !== null && isMeritListPublished !== undefined) {
      filter.isMeritListPublished = isMeritListPublished === "true";
    }

    const settings = await AdmissionSetting.find(filter).sort({
      className: 1,
    });

    return NextResponse.json(
      { success: true, data: settings },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch admission settings",
      },
      { status: 500 }
    );
  }
}

// POST /api/admission-settings
export async function createAdmissionSetting(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { className, admissionOpenUntil, meritListDate } = body;

    if (!className || !admissionOpenUntil || !meritListDate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "className, admissionOpenUntil and meritListDate are required",
        },
        { status: 400 }
      );
    }

    const newSetting = await AdmissionSetting.create(body);

    return NextResponse.json(
      { success: true, data: newSetting },
      { status: 201 }
    );
  } catch (error) {
    // duplicate className+academicYear
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Settings for this class and academic year already exist",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create admission setting",
      },
      { status: 500 }
    );
  }
}

// PUT /api/admission-settings?id=xxxx
export async function updateAdmissionSettingById(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "id query param is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const updated = await AdmissionSetting.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Admission setting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Settings for this class and academic year already exist",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update admission setting",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admission-settings?id=xxxx
export async function deleteAdmissionSettingById(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "id query param is required" },
        { status: 400 }
      );
    }

    const deleted = await AdmissionSetting.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Admission setting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Admission setting deleted" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete admission setting",
      },
      { status: 500 }
    );
  }
}