import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/app/models/users-model'; // You should create this model

const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-connection-string';

async function connectToDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
}

// POST: Admin login
export async function POST(request: Request) {
  try {
    await connectToDB();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required." }, { status: 400 });
    }

    // Find the admin by email
    const admin = await User.findOne({ email });
    console.log("Admin found:", admin, email);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Admin not found." }, { status: 404 });
    }

    // Compare password (plaintext for demo — use hashing in production)
    if (admin.password !== password) {
      return NextResponse.json({ success: false, message: "Incorrect password." }, { status: 401 });
    }

    // Success — return basic message or token
    return NextResponse.json({ success: true, message: "Login successful." }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}
