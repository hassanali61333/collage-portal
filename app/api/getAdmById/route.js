import { NextResponse } from "next/server";

import {getadmissionbyid} from "@/controllers/singleadmissionController.js";


export async function GET(req){
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
console.log(studentId)
const result = await getadmissionbyid({studentId})


return NextResponse.json(
    {
      success: result.success,
      message: result.message,
      data: result.data || null,
    },
    {
      status: result.status,
    }
)

}