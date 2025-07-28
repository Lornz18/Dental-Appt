import { NextRequest, NextResponse } from "next/server";
import Appointment from "@/app/models/appointment-model";
import mongoose from "mongoose";
import AppointmentConfirmationEmail from "@/components/emails/AppointmentConfirmationEmail";
import { Resend } from "resend";
import React from "react";
import WebSocket from "ws"; // Import the 'ws' library to act as a client
import Alert from "@/app/models/alert-model";

const MONGODB_URI = process.env.MONGODB_URI || "your-mongodb-connection-string";

interface Params {
  params: { id: string };
}

async function connectToDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
}

const resend = new Resend(process.env.RESEND_API_KEY);
const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

// --- WebSocket Notifier Helper Function ---
/**
 * Connects to the WebSocket server as a client, sends a message, and disconnects.
 * This is a "fire-and-forget" operation from the perspective of the API route.
 * @param message - The JavaScript object to send as the notification.
 */
function notifyWebSocketServer(message: object): void {
  if (!WS_URL) {
    console.error("WebSocket URL is not configured.");
    return;
  }
  const ws = new WebSocket(WS_URL);

  ws.on("open", () => {
    console.log(
      "API route connected to WebSocket server to send notification."
    );
    ws.send(JSON.stringify(message));
    ws.close(); // Close the connection after sending
  });

  ws.on("error", (error) => {
    // Log the error but don't let it fail the HTTP request.
    // The main operation (saving to DB) was successful.
    console.error("WebSocket notification error:", error);
  });

  ws.on("close", () => {
    console.log("API route disconnected from WebSocket server.");
  });
}
// ✅ GET appointment by ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectToDB();

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    const appointment = await Appointment.findById(id).lean();

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// ✅ PATCH (update) appointment by ID
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await connectToDB();
    const { id } = params;
    const body = await request.json();
    const { status, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    const existingAppointment = await Appointment.findById(id);

    if (!existingAppointment) {
      return NextResponse.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    const originalStatus = existingAppointment.status;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { status, ...updates },
      { new: true }
    ).lean();

    if (!updatedAppointment) {
      return NextResponse.json(
        { success: false, error: "Appointment not found during update" },
        { status: 404 }
      );
    }

    const newStatus = updatedAppointment.status;
    if (newStatus === "confirmed" && originalStatus !== "confirmed") {
      const patientEmail = updatedAppointment.patientEmail;
      console.log(`Sending confirmation email to: ${patientEmail}`);
      if (patientEmail) {
        try {
          await resend.emails.send({
            from: "Your Clinic <onboarding@resend.dev>",
            to: [patientEmail],
            subject: "Your Appointment is Confirmed!",
            react: React.createElement(AppointmentConfirmationEmail, {
              appointment: {
                ...updatedAppointment,
                _id: updatedAppointment._id.toString(),
              },
            }),
          });
          console.log(`Confirmation email sent to ${patientEmail}`);
        } catch (error) {
          console.error(`Failed to send confirmation email: ${error}`);
        }
      } else {
        console.warn(
          `Appointment ${id} confirmed, but no patient email found to send notification.`
        );
      }
    }

    if (newStatus === "cancelled" && originalStatus !== "cancelled") {
      console.log("Creating persistent alert in the database...");
          await Alert.create({
            message: `Appointment Cancellation from ${updatedAppointment.patientName}.`,
            type: "cancellation",
            link: `/appointment/${updatedAppointment._id}`, // Optional: link to the relevant item
          });
          console.log("Alert saved successfully.");
      notifyWebSocketServer({
        type: "new-alert", // Use a generic signal
        payload: {
          message: `Appointment with ID ${id} has been cancelled.`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// ✅ DELETE appointment by ID
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await connectToDB();

    const { id } = params;

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
