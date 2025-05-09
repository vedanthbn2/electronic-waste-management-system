import { NextRequest, NextResponse } from "next/server";

interface Notification {
  id: string;
  userId: string | null;
  receiverId?: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

let notifications: Notification[] = [];

/**
 * Notification object structure:
 * {
 *   id: string,
 *   userId: string,
 *   receiverId?: string,
 *   message: string,
 *   read: boolean,
 *   createdAt: string
 * }
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const receiverId = searchParams.get("receiverId");

  let filteredNotifications = notifications;

  if (userId) {
    filteredNotifications = filteredNotifications.filter(n => n.userId === userId);
  }
  if (receiverId) {
    filteredNotifications = filteredNotifications.filter(n => n.receiverId === receiverId);
  }

  return NextResponse.json({ success: true, data: filteredNotifications });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, receiverId, message } = body;

    if (!message) {
      return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 });
    }

    const newNotification: Notification = {
      id: Date.now().toString(),
      userId: userId || null,
      receiverId: receiverId || null,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    };

    notifications.push(newNotification);

    return NextResponse.json({ success: true, data: newNotification });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: false, error: "Unknown error" }, { status: 500 });
  }
}
