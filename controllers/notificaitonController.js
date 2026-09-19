// app/controllers/notificationController.js
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import notificatonModel from "@/models/notificationModel";

// ─────────────────────────────────────────────
// Model (inline — yahan define karo)
// ─────────────────────────────────────────────

export const sendNotification = async (request) => {
  try {
    await connectDB();

    const { title, message, sentBy } = await request.json();

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: "Title aur message dono required hain" },
        { status: 400 }
      );
    }

    const notification = await notificatonModel.create({
      title,
      message,
      sentBy: sentBy || null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Notification successfully bhej di gayi",
        data: notification,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[sendNotification]", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
};

// ─────────────────────────────────────────────
// READ — Get all notifications
// ─────────────────────────────────────────────
export const getAllNotifications = async () => {
  try {
    await connectDB();

    const notifications = await notificatonModel.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error("[getAllNotifications]", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
};

// ─────────────────────────────────────────────
// DELETE — Remove notification by id
// ─────────────────────────────────────────────
export const deleteNotification = async (request) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Notification id required" },
        { status: 400 }
      );
    }

    const notification = await notificatonModel.findByIdAndDelete(id);

    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notification nahi mili" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification delete ho gayi",
    });
  } catch (error) {
    console.error("[deleteNotification]", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
};