import SeatConfig from "@/models/seatsModel.js";
import AdmissionModel from "../models/admissionModel.js";
import connectDB from "@/lib/db.js";

// ADD / UPDATE (upsert) - className + shift ke base pe
export async function setSeatConfig(req) {
  try {
    await connectDB();
    const { className, shift, totalSeats } = await req.json();

    if (!className || !shift || totalSeats === undefined) {
      return {
        success: false,
        message: "className, shift aur totalSeats zaroori hain",
        status: 400,
      };
    }

    const config = await SeatConfig.findOneAndUpdate(
      { className, shift },
      { totalSeats },
      { upsert: true, new: true }
    );

    return {
      success: true,
      message: "Seat config save ho gaya",
      data: config,
      status: 200,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Kuch ghalat ho gaya",
      status: 500,
    };
  }
}

// GET ALL with filled/remaining
export async function getSeatAvailability() {
  try {
    await connectDB();
    const configs = await SeatConfig.find();

    const result = await Promise.all(
      configs.map(async (config) => {
        const filled = await AdmissionModel.countDocuments({
          classInAdmission: config.className,
          shift: config.shift,
        });

        return {
          _id: config._id,
          className: config.className,
          shift: config.shift,
          totalSeats: config.totalSeats,
          filledSeats: filled,
          remainingSeats: config.totalSeats - filled,
        };
      })
    );

    return {
      success: true,
      message: "Seat availability mil gayi",
      data: result,
      status: 200,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Kuch ghalat ho gaya",
      status: 500,
    };
  }
}

// UPDATE SINGLE (by id) — ab ye sahi se export ho raha hai
export async function updateSeatInDb(req) {   // ← id parameter hatao
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");   // ✅ sirf yahan se

    if (!id) {
      return Response.json(
        { success: false, message: "ID required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { className, shift, totalSeats } = body;

    const updated = await SeatConfig.findByIdAndUpdate(
      id,
      { className, shift, totalSeats },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return Response.json(
        { success: false, message: "Seat config nahi mila" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, message: "Seat updated successfully", data: updated },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { success: false, message: error.message || "Kuch ghalat ho gaya" },
      { status: 500 }
    );
  }
}

export async function deleteSingleSeatConfig(req) {   // ← id parameter hatao
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");   // ✅ sirf yahan se

    if (!id) {
      return Response.json(
        { success: false, message: "ID required" },
        { status: 400 }
      );
    }

    const config = await SeatConfig.findByIdAndDelete(id);

    if (!config) {
      return Response.json(
        { success: false, message: "Seat config nahi mila" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, message: "Seat config delete ho gaya", data: config },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { success: false, message: error.message || "Kuch ghalat ho gaya" },
      { status: 500 }
    );
  }
}