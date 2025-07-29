import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import React from "react";
import ContactFormEmail from "@/components/emails/ContactFormEmail"; // We will create this component next

// --- Environment Variables ---
// Ensure these are set in your .env.local file
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_FORM_RECEIVER_EMAIL = "audielorenz18@gmail.com";

// --- Initialize Resend ---
// It's good practice to check for the API key at initialization
if (!RESEND_API_KEY) {
  console.error("Resend API key is not set in environment variables.");
  // This will prevent the app from even starting without the key, which is a good safety measure.
  // In a real app, you might handle this more gracefully, but for an API route, this is effective.
}
const resend = new Resend(RESEND_API_KEY);

// ===================================================================
//   POST: Handle Contact Form Submission
// ===================================================================
export async function POST(request: NextRequest) {
  // Check for required environment variables before proceeding
  if (!RESEND_API_KEY || !CONTACT_FORM_RECEIVER_EMAIL) {
    console.error("Missing required environment variables for sending email.");
    return NextResponse.json(
      { success: false, message: "Server configuration error." },
      { status: 500 }
    );
  }

  try {
    // 1. Parse the incoming request body
    const body = await request.json();
    const { name, email, subject, message } = body;

    // 2. --- Data Validation ---
    // Ensure all required fields are present and not just empty strings
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, message: "Full Name, Email, and Message are required." },
        { status: 400 } // Bad Request
      );
    }
    
    // A simple email format check
    if (!/\S+@\S+\.\S+/.test(email)) {
        return NextResponse.json(
          { success: false, message: "Please provide a valid email address." },
          { status: 400 }
        );
    }

    // 3. --- Send Email with Resend ---
    const { data, error } = await resend.emails.send({
      // IMPORTANT: The 'from' address MUST be a verified domain on Resend.
      // It cannot be the user's email address. 'onboarding@resend.dev' is for testing.
      // Replace with your own domain, e.g., 'Contact Form <noreply@yourdomain.com>'
      from: "Your Website <onboarding@resend.dev>",
      
      // The email address where you want to receive the contact form submissions
      to: [CONTACT_FORM_RECEIVER_EMAIL],
      
      // Set the subject of the email you will receive
      subject: `New Contact Form Submission: ${subject || "No Subject"}`,
      
      // IMPORTANT: This allows you to "Reply" directly to the user from your inbox
      replyTo: email,
      
      // Use a React component for the email body for clean, structured HTML
      react: React.createElement(ContactFormEmail, {
        name,
        email,
        subject: subject || "No Subject Provided",
        message,
      }),
    });

    // Handle potential errors from the Resend API
    if (error) {
      console.error("Resend API Error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to send message.", error: error.message },
        { status: 500 }
      );
    }

    // 4. --- Success Response ---
    // If the email is sent successfully, return a success message
    return NextResponse.json(
      {
        success: true,
        message: "Your message has been sent successfully! We will get back to you shortly.",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle unexpected errors (e.g., JSON parsing failed, etc.)
    console.error("POST /api/contact Error:", error);
    const errorMessage = (error as Error).message || "An unknown error occurred.";
    return NextResponse.json(
      { success: false, message: `An error occurred: ${errorMessage}` },
      { status: 500 }
    );
  }
}