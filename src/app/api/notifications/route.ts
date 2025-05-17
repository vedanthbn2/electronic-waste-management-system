import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

interface Notification {
  id: string;
  userId: string | null;
  receiverId?: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

const DATA_FILE = path.join(process.cwd(), "notifications.json");

let notifications: Notification[] = [];

async function loadNotifications() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    if (!data || data.trim() === "") {
      notifications = [];
      await fs.writeFile(DATA_FILE, "[]");
    } else {
      try {
        notifications = JSON.parse(data);
      } catch (parseError) {
        console.error("Error parsing notifications JSON:", parseError);
        notifications = [];
        await fs.writeFile(DATA_FILE, "[]");
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      await fs.writeFile(DATA_FILE, "[]");
      notifications = [];
    } else {
      console.error("Error loading notifications:", error);
    }
  }
}

async function saveNotifications() {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(notifications, null, 2));
  } catch (error: unknown) {
    console.error("Error saving notifications:", error);
  }
}

async function initializeNotifications() {
  await loadNotifications();
}

initializeNotifications();

export async function GET(request: NextRequest) {
  await loadNotifications();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const receiverId = searchParams.get("receiverId");

  let filteredNotifications = notifications;

  if (userId) {
    filteredNotifications = filteredNotifications.filter(
      (n) => n.userId === userId
    );
  }
  if (receiverId) {
    filteredNotifications = filteredNotifications.filter(
      (n) => n.receiverId === receiverId
    );
  }

  return NextResponse.json({ success: true, data: filteredNotifications });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, receiverId, message } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    // Remove oldest notifications if more than 4 exist for this user/receiver
    const filterKey = userId ? "userId" : receiverId ? "receiverId" : null;
    const filterValue = userId || receiverId || null;

    if (filterKey && filterValue) {
      const userNotifications = notifications.filter(n => n[filterKey] === filterValue);
      if (userNotifications.length >= 5) {
        // Sort by createdAt ascending (oldest first)
        userNotifications.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        // Remove oldest notifications to keep only 4
        const toRemove = userNotifications.length - 4;
        const idsToRemove = userNotifications.slice(0, toRemove).map(n => n.id);
        notifications = notifications.filter(n => !idsToRemove.includes(n.id));
      }
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
    await saveNotifications();

    return NextResponse.json({ success: true, data: newNotification });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Unknown error" },
      { status: 500 }
    );
  }
}
