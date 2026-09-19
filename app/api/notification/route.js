// app/api/notification/route.js
import {
  sendNotification,
  getAllNotifications,
  deleteNotification,
} from "@/controllers/notificaitonController.js"

// ─────────────────────────────────────────────
// POST — Create
// ─────────────────────────────────────────────
export async function POST(request) {
  return sendNotification(request);
}

// ─────────────────────────────────────────────
// GET — List all
// ─────────────────────────────────────────────
export async function GET() {
  return getAllNotifications();
}

// ─────────────────────────────────────────────
// DELETE — By id (?id=xxx)
// ─────────────────────────────────────────────
export async function DELETE(request) {
  return deleteNotification(request);
}