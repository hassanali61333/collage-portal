// app/api/auth/route.js
import { signup, login } from "@/controllers/usersController.js";

export async function POST(req) {
  const result = await signup(req);
  return Response.json(result, { status: result.status });
}

export async function GET(req) {
  const result = await login(req);
  return Response.json(result, { status: result.status });
}