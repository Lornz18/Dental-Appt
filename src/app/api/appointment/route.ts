import { NextRequest, NextResponse } from "next/server";
import Appointment from "@/app/models/appointment-model"; // Mongoose model
import Alert from "@/app/models/alert-model";
import mongoose from "mongoose";
import WebSocket from "isomorphic-ws"; // Import the 'ws' library to act as a client

const MONGODB_URI = process.env.MONGODB_URI || "your-mongodb-connection-string";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

async function connectToDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
}

// --- WebSocket Notifier Helper Function ---
/**
 * Connects to the WebSocket server as a client, sends a message, and disconnects.
 * This is a "fire-and-forget" operation from the perspective of the API route.
 * @param message - The JavaScript object to send as the notification.
 */
// --- A more robust WebSocket Notifier that works in serverless environments ---
function notifyWebSocketServer(message: object): Promise<void> {
  return new Promise((resolve, reject) => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) {
      console.error("WebSocket URL is not configured.");
      return reject(new Error("WebSocket URL is not configured."));
    }

    console.log(`Attempting to connect to WebSocket server at: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);

    // Set a timeout to prevent the API route from hanging forever
    const connectionTimeout = setTimeout(() => {
      ws.terminate(); // Forcefully close the connection
      console.error("WebSocket connection timed out.");
      reject(new Error("WebSocket connection timed out after 8 seconds."));
    }, 8000); // 8-second timeout is reasonable for a serverless function

    ws.on("open", () => {
      clearTimeout(connectionTimeout); // Connection was successful, clear the timeout
      console.log("SUCCESS: API route connected to WebSocket server.");
      
      ws.send(JSON.stringify(message), (err) => {
        if (err) {
          console.error("Error sending WebSocket message:", err);
          reject(err); // Reject the promise if sending fails
        } else {
          console.log("Message sent successfully over WebSocket.");
          resolve(); // Resolve the promise after the message is sent
        }
        ws.close(); // Close the connection
      });
    });

    ws.on("error", (error) => {
      clearTimeout(connectionTimeout);
      console.error("WebSocket connection error:", error.message);
      reject(error); // Reject the promise on any connection error
    });

    ws.on("close", () => {
      clearTimeout(connectionTimeout);
      console.log("API route disconnected from WebSocket server.");
    });
  });
}

// POST: Create a new appointment
export async function POST(request: Request) {
  try {
    await connectToDB();

    const body = await request.json();
    console.log("Received appointment data:", body);

    // Validate required fields from your schema
    if (
      !body.patientName ||
      !body.appointmentDate ||
      !body.appointmentTime ||
      !body.durationMinutes
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Patient name, date, time, and duration are required.",
        },
        { status: 400 }
      );
    }

    // Create the Mongoose document for the appointment
    const appointment = new Appointment({
      patientName: body.patientName,
      patientEmail: body.patientEmail,
      appointmentDate: new Date(body.appointmentDate),
      appointmentTime: body.appointmentTime,
      reason: body.reason,
      durationMinutes: body.durationMinutes,
      status: "pending", // New appointments should always start as pending
    });

    const savedAppointment = await appointment.save();
    console.log("Saved Appointment:", savedAppointment);

    // --- 2. Create and save the corresponding Alert to the database ---
    // This creates a permanent record of the notification.
    console.log("Creating persistent alert in the database...");
    await Alert.create({
      message: `New pending appointment from ${savedAppointment.patientName}.`,
      type: "new-appointment",
    });
    console.log("Alert saved successfully.");

    // --- 3. Send a real-time signal via WebSocket ---
    // The signal is now more generic, telling clients "there's a new alert".
    // The client should then fetch from a new `/api/alerts` endpoint.
    console.log("Sending notification signal to WebSocket server...");
    await notifyWebSocketServer({
      type: "new-alert", // Use a generic signal
      payload: {
        message: `New pending appointment from ${savedAppointment.patientName}.`,
      },
    });

    return NextResponse.json({ success: true, id: savedAppointment._id });
  } catch (error) {
    console.error("Error creating appointment:", error); // Log the full error

    // Handle Mongoose validation errors specifically for better feedback
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}

// GET: Get all appointments
export async function GET() {
  try {
    await connectToDB();

    const appointments = await Appointment.find();
    return NextResponse.json({ success: true, appointments });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PATCH: Update an appointment by ID
export async function PATCH(request: Request) {
  try {
    await connectToDB();

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!updatedAppointment) {
      return NextResponse.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, updatedAppointment });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Correctly typed DELETE method for dynamic route [id]
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } } // ✅ CORRECT TYPE
) {
  try {
    await connectToDB();

    const { id } = context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    const deletedAppointment = await Appointment.findByIdAndDelete(id);

    if (!deletedAppointment) {
      return NextResponse.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deletedAppointment });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
