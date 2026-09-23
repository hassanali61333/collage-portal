import SeatConfig from "@/models/seatsModel.js";
import AdmissionModel from "../models/admissionModel.js";
import connectDB from "@/lib/db.js";

// ---------- Helper: validation for totalSeats and meritNo ----------
// Skips any field that is not sent (or sent as "")
function parseSeatNumbers({ totalSeats, meritNo }) {
  const update = {};
  const has = (v) => v !== undefined && v !== null && v !== "";

  if (has(totalSeats)) {
    const seats = Number(totalSeats);
    if (!Number.isInteger(seats) || seats < 0) {
      return { error: "totalSeats must be a whole number greater than or equal to 0" };
    }
    update.totalSeats = seats;
  }

  if (has(meritNo)) {
    const merit = Number(meritNo);
    if (isNaN(merit) || merit < 0 || merit > 100) {
      return { error: "meritNo must be between 0 and 100" };
    }
    update.meritNo = merit;
  }

  return { update };
}

// ---------- ADD (create only) - based on className + shift ----------
export async function setSeatConfig(req) {
  try {
    await connectDB();
    const { className, shift, totalSeats, meritNo } = await req.json();

    if (!className || !shift) {
      return {
        success: false,
        message: "className and shift are required",
        status: 400,
      };
    }

    const cleanClass = String(className).trim();
    const cleanShift = String(shift).trim().toLowerCase();

    // Duplicate check — same class + shift already exists?
    const existing = await SeatConfig.findOne({
      className: cleanClass,
      shift: cleanShift,
    });

    if (existing) {
      return {
        success: false,
        message: `A seat config for ${cleanClass} (${cleanShift}) already exists. Please edit it or choose a different shift.`,
        status: 409,
      };
    }

    const { update, error } = parseSeatNumbers({ totalSeats, meritNo });
    if (error) {
      return { success: false, message: error, status: 400 };
    }

    if (Object.keys(update).length === 0) {
      return {
        success: false,
        message: "Please send at least one of totalSeats or meritNo",
        status: 400,
      };
    }

    const config = await SeatConfig.create({
      className: cleanClass,
      shift: cleanShift,
      ...update,
    });

    return {
      success: true,
      message: "Seat config saved successfully",
      data: config,
      status: 201,
    };
  } catch (error) {
    // Duplicate key from unique index (race condition)
    if (error.code === 11000) {
      return {
        success: false,
        message: "A record for this class and shift already exists",
        status: 409,
      };
    }
    return {
      success: false,
      message: error.message || "Something went wrong",
      status: 500,
    };
  }
}

// ---------- GET ALL with filled/remaining ----------
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

        const total = config.totalSeats ?? 0;

        return {
          _id: config._id,
          className: config.className,
          shift: config.shift,
          totalSeats: config.totalSeats ?? null,
          meritNo: config.meritNo ?? null,
          filledSeats: filled,
          remainingSeats: Math.max(total - filled, 0),
        };
      })
    );

    return {
      success: true,
      message: "Seat availability fetched successfully",
      data: result,
      status: 200,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Something went wrong",
      status: 500,
    };
  }
}

// ---------- UPDATE by id ----------
export async function updateSeatInDb(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return { success: false, message: "ID is required", status: 400 };
    }

    const { className, shift, totalSeats, meritNo } = await req.json();

    const { update, error } = parseSeatNumbers({ totalSeats, meritNo });
    if (error) {
      return { success: false, message: error, status: 400 };
    }

    // Only update className if it was sent
    if (className !== undefined) {
      const c = String(className).trim();
      if (!c) {
        return { success: false, message: "className cannot be empty", status: 400 };
      }
      update.className = c;
    }

    // Only update shift if it was sent
    if (shift !== undefined) {
      const s = String(shift).trim().toLowerCase();
      if (!s) {
        return { success: false, message: "shift cannot be empty", status: 400 };
      }
      update.shift = s;
    }

    if (Object.keys(update).length === 0) {
      return { success: false, message: "No fields provided for update", status: 400 };
    }

    const updated = await SeatConfig.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return { success: false, message: "Seat config not found", status: 404 };
    }

    return {
      success: true,
      message: "Seat updated successfully",
      data: updated,
      status: 200,
    };
  } catch (error) {
    // Unique index (className + shift) conflict
    if (error.code === 11000) {
      return {
        success: false,
        message: "A record for this class and shift already exists",
        status: 409,
      };
    }
    // Invalid ObjectId format
    if (error.name === "CastError") {
      return { success: false, message: "Invalid ID", status: 400 };
    }
    return {
      success: false,
      message: error.message || "Something went wrong",
      status: 500,
    };
  }
}

// ---------- DELETE by id ----------
export async function deleteSingleSeatConfig(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return { success: false, message: "ID is required", status: 400 };
    }

    const config = await SeatConfig.findByIdAndDelete(id);

    if (!config) {
      return { success: false, message: "Seat config not found", status: 404 };
    }

    return {
      success: true,
      message: "Seat config deleted successfully",
      data: config,
      status: 200,
    };
  } catch (error) {
    if (error.name === "CastError") {
      return { success: false, message: "Invalid ID", status: 400 };
    }
    return {
      success: false,
      message: error.message || "Something went wrong",
      status: 500,
    };
  }
}