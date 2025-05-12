import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const usersFilePath = path.resolve(process.cwd(), "users.json");
    const receiversFilePath = path.resolve(process.cwd(), "receivers.json");

    const usersFileContents = fs.readFileSync(usersFilePath, "utf-8");
    const receiversFileContents = fs.readFileSync(receiversFilePath, "utf-8");

    const users = JSON.parse(usersFileContents);
    const receivers = JSON.parse(receiversFileContents);

    // Search in users.json
    let user = users.find((u: { email: string; password: string }) => u.email === email && u.password === password);

    // If not found in users.json, search in receivers.json
    if (!user) {
      user = receivers.find((r: { email: string; password: string }) => r.email === email && r.password === password);
      if (user) {
        user.role = "receiver";
      }
    } else {
      // Add role field if missing, default to "user"
      if (!user.role) {
        if (user.name && user.name.toLowerCase().includes("receiver")) {
          user.role = "receiver";
        } else if (user.email && user.email.toLowerCase().includes("receiver")) {
          user.role = "receiver";
        } else {
          user.role = "user";
        }
      }
    }

    if (user) {
      // Add dummy token for now
      user.token = "dummy-token-" + user.id;

      return NextResponse.json(user);
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
