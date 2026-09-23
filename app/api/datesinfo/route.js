import {
  getAdmissionSettings,
  createAdmissionSetting,
  updateAdmissionSettingById,
  deleteAdmissionSettingById,
} from "@/controllers/dateinfoContorller.js";

// GET    /api/admission-settings                 -> list (filter: ?className=&academicYear=)
// GET    /api/admission-settings?id=xxxx          -> single record
// POST   /api/admission-settings                 -> create
// PUT    /api/admission-settings?id=xxxx          -> update
// DELETE /api/admission-settings?id=xxxx          -> delete

export async function GET(request) {
  return getAdmissionSettings(request);
}

export async function POST(request) {
  return createAdmissionSetting(request);
}

export async function PUT(request) {
  return updateAdmissionSettingById(request);
}

export async function DELETE(request) {
  return deleteAdmissionSettingById(request);
}