import { NextResponse } from "next/server";
import { setSeatConfig, getSeatAvailability, updateSeatInDb ,deleteSingleSeatConfig} from "@/controllers/seatsController.js";

export async function POST(req) {
  const result = await setSeatConfig(req);
  return NextResponse.json(
    { success: result.success, message: result.message, data: result.data || null },
    { status: result.status }
  );
}

export async function GET() {
  const result = await getSeatAvailability();
  return NextResponse.json(
    { success: result.success, message: result.message, data: result.data || null },
    { status: result.status }
  );
}

export async function PUT(req) {
  const result = await updateSeatInDb(req);
  return NextResponse.json(
    { success: result.success, message: result.message, data: result.data || null },
    { status: result.status }
  );
}


export async function DELETE(id) {
  const result = await deleteSingleSeatConfig(id);
  console.log("DELETE result:", result); // Debugging line
  return NextResponse.json(
    { success: result.success, message: result.message, data: result.data || null },
    { status: result.status }
  );
}