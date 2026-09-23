import getapprovedstudent from "@/controllers/approvedstuModel.js";

export async function GET() {
  return await getapprovedstudent();
}