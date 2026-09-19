import { NextResponse } from "next/server";
import { signup ,login} from  "@/controllers/usersController.js";

export async function POST(req) {
  const result = await signup(req);

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


export async function GET(req) {

  const result = await login(req);
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