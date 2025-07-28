import { NextRequest, NextResponse } from "next/server";
import Appointment from "@/app/models/appointment-model"; // Mongoose model
import mongoose from "mongoose";
import AppointmentConfirmationEmail from "@/components/emails/AppointmentConfirmationEmail";
import { Resend } from "resend";
import React from "react";

const MONGODB_URI = process.env.MONGODB_URI || "your-mongodb-connection-string";

interface Params {
  params: { id: string } 
}

async function connectToDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PATCH(
  request: NextRequest,
  { params }: Params // Keep `unknown` for robustness, then cast
) {
  try {
    await connectToDB();
    const { id } = params;
    const body = await request.json();
    const { status, ...updates } = body;
    

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // 2. Find the original appointment BEFORE updating to check its old status
    const existingAppointment = await Appointment.findById(id);

    if (!existingAppointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    // Store the original status
    const originalStatus = existingAppointment.status;

    // 3. Perform the update
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { status, ...updates }, // Apply all updates
      { new: true } // Return the updated document
    ).lean(); // Use .lean() for a plain JS object if you don't need Mongoose methods after this

    if (!updatedAppointment) {
      // This case is largely covered by the check above, but good for safety
      return NextResponse.json(
        { success: false, error: 'Appointment not found during update' },
        { status: 404 }
      );
    }

    // 4. Conditionally send email if status changed to 'confirmed'
    const newStatus = updatedAppointment.status;
    if (newStatus === 'confirmed' && originalStatus !== 'confirmed') {
      try {
        // Assume your Appointment model has these fields. Adjust as necessary.
        // The patient's email is essential here.
        const patientEmail = updatedAppointment.patientEmail;
        console.log(`Sending confirmation email to: ${patientEmail}`);
        if (patientEmail) {
          try {
            await resend.emails.send({
              from: 'Your Clinic <onboarding@resend.dev>', // MUST be a verified domain in Resend
              to: [patientEmail],
              subject: 'Your Appointment is Confirmed!',
              react: React.createElement(AppointmentConfirmationEmail, { appointment: updatedAppointment }),
            });
            console.log(`Confirmation email sent to ${patientEmail}`);
          } catch (error) {
            console.error(`Failed to send confirmation email: ${error}`);
          }
        } else {
            console.warn(`Appointment ${id} confirmed, but no patient email found to send notification.`);
        }
      } catch (emailError) {
        // IMPORTANT: The DB update succeeded, so we don't want to fail the whole request.
        // We log the error for monitoring and maybe manual follow-up.
        console.error(`Failed to send confirmation email for appointment ${id}:`, emailError);
      }
    }

    return NextResponse.json({ success: true, appointment: updatedAppointment });

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
