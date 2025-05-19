import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "../../mongodb";
import User from "../../../models/User";
import Receiver from "../../../models/Receiver";

await dbConnect();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const emailTrimmed = email.trim().toLowerCase();
    const passwordTrimmed = password.trim();

    // Check User collection
    const user = await User.findOne({ email: emailTrimmed });
    if (user) {
      const isMatch = await bcrypt.compare(passwordTrimmed, user.password);
      if (isMatch) {
        return NextResponse.json({
          success: true,
          id: user._id,
          email: user.email,
          fullName: user.name,
          phoneNumber: user.phone,
          token: "mock-token-" + Date.now(),
          role: "user",
        });
      }
    }

    // Check Receiver collection
    const receiver = await Receiver.findOne({ email: emailTrimmed });
    if (receiver) {
      const isMatch = await bcrypt.compare(passwordTrimmed, receiver.password);
      if (isMatch) {
        return NextResponse.json({
          success: true,
          id: receiver._id,
          email: receiver.email,
          fullName: receiver.name,
          phoneNumber: receiver.phone,
          token: "mock-token-" + Date.now(),
          role: "receiver",
        });
      }
    }

    return NextResponse.json(
      { success: false, error: "Invalid email or password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
