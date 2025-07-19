// pages/api/clinic-settings.js (or wherever your API routes are)

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ClinicSetting from "@/app/models/clinic-setting-model"; // Adjust the path if needed

// Assuming MONGODB_URI is set in your environment variables
const MONGODB_URI = process.env.MONGODB_URI || "your-mongodb-connection-string";

// Function to ensure DB connection
async function connectToDB() {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw new Error("Database connection failed.");
    }
  }
}

// Function to handle potential database connection errors gracefully
async function ensureDbConnection() {
  try {
    await connectToDB();
    return true; // Connection successful or already connected
  } catch (error) {
    console.error("DB Connection failed:", error);
    // Return a NextResponse directly from here to stop further processing
    return NextResponse.json(
      { success: false, message: "Could not connect to the database." },
      { status: 500 }
    );
  }
}

// --- API Handlers ---

// GET: Fetch Clinic Settings
export async function GET(request: Request) {
  const dbCheckResult = await ensureDbConnection();
  if (dbCheckResult instanceof NextResponse) {
    return dbCheckResult; // Return the error response if connection failed
  }

  try {
    // In a real app, you'd likely fetch based on a specific ID or identifier
    // For simplicity, we'll assume there's only one clinic settings document
    // You might need to find it first if it's not guaranteed to exist.
    let settings = await ClinicSetting.findOne();

    if (!settings) {
      // If no settings exist yet, you could either:
      // 1. Return an empty response or a specific "not found" status.
      // 2. Create default settings here and return them.
      // Let's go with returning null or empty, frontend will handle defaults.
      return NextResponse.json(
        { success: true, settings: null },
        { status: 200 }
      );
    }

    // Convert Mongoose document to plain JSON
    const settingsJson = settings.toObject();

    return NextResponse.json(
      { success: true, settings: settingsJson },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/clinic-settings Error:", error);
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST: Update or Create Clinic Settings
export async function POST(request: Request) {
  const dbCheckResult = await ensureDbConnection();
  if (dbCheckResult instanceof NextResponse) {
    return dbCheckResult; // Return the error response if connection failed
  }

  try {
    const settingsData = await request.json();

    // --- Data Validation (Crucial!) ---
    // You'll want more robust validation here.
    // This could involve a library like Zod, Yup, or simply checking required fields.
    // For example, checking if regularHours.startTime and .endTime exist and are valid time strings.

    if (!settingsData || typeof settingsData !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid data provided." },
        { status: 400 }
      );
    }

    // Example basic validation: Ensure regularHours are present
    if (
      !settingsData.regularHours ||
      !settingsData.regularHours.startTime ||
      !settingsData.regularHours.endTime
    ) {
      return NextResponse.json(
        { success: false, message: "Regular hours are required." },
        { status: 400 }
      );
    }
    // Add more checks for other fields as needed...

    // Find existing settings or create new ones
    // Assumes a single document; adjust if you have multiple clinic settings profiles
    let settings = await ClinicSetting.findOne();

    if (!settings) {
      // Create new settings document
      settings = new ClinicSetting(settingsData);
    } else {
      console.log(
        "Document found before saving. ID:",
        settings._id,
        "Version:",
        settings.__v
      );
      Object.assign(settings, settingsData);
      settings.updatedAt = new Date();
      console.log("Document state before save:", JSON.stringify(settings)); // Log the entire document state
    }

    await settings.save();

    // Convert to JSON for response
    const savedSettingsJson = settings.toObject();

    return NextResponse.json(
      {
        success: true,
        message: "Settings saved successfully.",
        settings: savedSettingsJson,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST /api/clinic-settings Error:", error);
    // Handle specific validation errors or general errors
    let errorMessage = (error as Error).message;
    if (error.name === "ValidationError") {
      // Mongoose validation error
      errorMessage = Object.values((error as any).errors)
        .map((err: any) => err.message)
        .join(", ");
      return NextResponse.json(
        { success: false, message: `Validation Error: ${errorMessage}` },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: `An error occurred: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// You might also want a DELETE handler if you allow deleting set
