// app/contact/page.tsx

'use client';

import Link from 'next/link';
import React, { useState, useEffect, FormEvent } from 'react';

// --- Helper Function to Format Time ---
const formatTime = (timeStr: string | undefined | null): string => {
  if (!timeStr) return '';
  try {
    // Assuming timeStr is in "HH:MM" format
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return timeStr; // Return original if invalid

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch (error) {
    console.error("Error formatting time:", timeStr, error);
    return timeStr; // Return original string if formatting fails
  }
};

// --- Interface for the data structure returned by the API ---
interface ClinicSettingsApiResponse {
  success: boolean;
  settings: {
    regularHours: { startTime: string; endTime: string };
    saturdayHours: { startTime: string; endTime: string } | null;
    sundayHours: { startTime: string; endTime: string } | null;
    // Include other fields if you plan to expose them, but for hours, these are key
    // customHours: any[]; // Adjust type if needed
    // recurringClosures: any[]; // Adjust type if needed
  } | null; // Settings can be null if not found
  message?: string;
}

/**
 * ContactPage Component
 *
 * Modern, professional contact page for the clinic with enhanced UI/UX.
 * Features a cohesive color system, improved form design, and better visual hierarchy.
 * Dynamically fetches and displays opening hours.
 */
const ContactPage: React.FC = () => {
  // State for form inputs
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // State for form submission status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // State for opening hours fetched from the API
  const [openingHours, setOpeningHours] = useState<
    | {
        regularHours: { startTime: string; endTime: string };
        saturdayHours: { startTime: string; endTime: string } | null;
        sundayHours: { startTime: string; endTime: string } | null;
      }
    | null
  >(null);
  const [hoursLoading, setHoursLoading] = useState<boolean>(true);
  const [hoursError, setHoursError] = useState<string | null>(null);

  // --- Effect to Fetch Opening Hours ---
  useEffect(() => {
    const fetchClinicHours = async () => {
      setHoursLoading(true);
      try {
        const response = await fetch('/api/clinic-setting'); // Call the new API route
        if (!response.ok) {
          const errorData = await response.json();
          // Extract message if available, otherwise use status text
          const errorMessage = errorData.message || response.statusText || 'An unknown error occurred';
          throw new Error(`HTTP error! Status: ${response.status} - ${errorMessage}`);
        }
        const data: ClinicSettingsApiResponse = await response.json();

        if (data.success && data.settings) {
          setOpeningHours(data.settings);
        } else {
          // Handle cases where success is false or settings is null/missing
          throw new Error(data.message || 'Clinic settings not found or invalid data received.');
        }
      } catch (error) {
        console.error("Failed to fetch clinic hours:", error);
        setHoursError((error as Error).message);
      } finally {
        setHoursLoading(false);
      }
    };

    fetchClinicHours();
  }, []); // Run only once on component mount

  /**
   * Handles the form submission event.
   * @param e - The form event.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Prevent default browser form submission

    // Basic client-side validation
    if (!name || !email || !message) {
      setSubmissionError('Please fill in all required fields (Name, Email, Message).');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setSubmissionError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionMessage(null); // Clear previous messages
    setSubmissionError(null);

    try {
      const response = await fetch('/api/contact', { // Your existing contact API
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message. Please try again later.');
      }

      // Success
      setSubmissionMessage('Thank you for your message! We will get back to you soon.');
      // Clear form fields on successful submission
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');

    } catch (error) {
      console.error("Form submission error:", error);
      setSubmissionError((error as Error).message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to render hours for a given day
  const renderHours = (dayHours: { startTime: string; endTime: string } | null | undefined): React.ReactNode => {
    // Check if the hours object exists and has valid times
    if (!dayHours || !dayHours.startTime || !dayHours.endTime) {
      return <span className="font-medium text-red-500">Closed</span>;
    }
    return `${formatTime(dayHours.startTime)} - ${formatTime(dayHours.endTime)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Get in Touch
            </h1>
            <p className="text-xl md:text-2xl opacity-90 leading-relaxed">
              We&apos;re here to help and answer any questions you may have
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-7xl mx-auto">

          {/* Quick Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {/* Phone Card */}
            <div className="bg-card rounded-xl shadow-lg border border-border p-8 text-center hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Call Us</h3>
              <p className="text-muted-foreground mb-4">Speak with our friendly staff</p>
              <Link href="tel:+1234567890" className="text-primary hover:text-primary/80 font-semibold text-lg transition-colors duration-200">
                +1 (234) 567-890 {/* Placeholder phone */}
              </Link>
            </div>

            {/* Email Card */}
            <div className="bg-card rounded-xl shadow-lg border border-border p-8 text-center hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/30 transition-colors duration-300">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Email Us</h3>
              <p className="text-muted-foreground mb-4">Send us your questions</p>
              <Link href="mailto:info@yourclinic.com" className="text-secondary hover:text-secondary/80 font-semibold text-lg transition-colors duration-200">
                info@yourclinic.com {/* Placeholder email */}
              </Link>
            </div>

            {/* Location Card */}
            <div className="bg-card rounded-xl shadow-lg border border-border p-8 text-center hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/30 transition-colors duration-300">
                <svg className="w-8 h-8 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Visit Us</h3>
              <p className="text-muted-foreground mb-4">Come see us in person</p>
              <div className="text-accent-foreground font-semibold">
                123 Health Lane<br /> {/* Placeholder Address */}
                Medical City, MC 45678
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* Contact Information Column */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl shadow-lg border border-border p-8 sticky top-8">
                <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Contact Information
                </h2>

                {/* Opening Hours Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Opening Hours
                  </h3>
                  {hoursLoading && <p className="text-muted-foreground">Loading hours...</p>}
                  {hoursError && <p className="text-red-500">Error loading hours: {hoursError}</p>}
                  {!hoursLoading && !hoursError && openingHours && (
                    <div className="space-y-2 text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Monday - Friday:</span>
                        <span className="font-medium">{renderHours(openingHours.regularHours)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday:</span>
                        <span className="font-medium">{renderHours(openingHours.saturdayHours)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday:</span>
                        <span className="font-medium">{renderHours(openingHours.sundayHours)}</span>
                      </div>
                    </div>
                  )}
                  {!hoursLoading && !hoursError && !openingHours && (
                     <p className="text-muted-foreground">Opening hours not available.</p>
                  )}
                </div>

                {/* Emergency Notice */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-red-800 mb-1">Emergency Notice</h4>
                      <p className="text-red-700 text-sm">
                        For medical emergencies, please call 911 or go to your nearest emergency room immediately.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Map Placeholder */}
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Find Us
                  </h3>
                  <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-muted-foreground border border-border">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="font-medium">Interactive Map</p>
                      <p className="text-sm">(Coming Soon)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Column */}
            <div className="lg:col-span-3">
              <div className="bg-card rounded-2xl shadow-lg border border-border p-8 md:p-12">
                <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  Send us a Message
                </h2>

                {/* Display submission status messages */}
                {submissionMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl mb-6 flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <strong className="font-semibold">Success!</strong>
                      <p className="mt-1">{submissionMessage}</p>
                    </div>
                  </div>
                )}
                {submissionError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl mb-6 flex items-start gap-3">
                    <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <strong className="font-semibold">Error!</strong>
                      <p className="mt-1">{submissionError}</p>
                    </div>
                  </div>
                )}

                {/* Contact Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 text-foreground"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 text-foreground"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-foreground mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 text-foreground"
                      placeholder="What is this regarding?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 text-foreground resize-none"
                      placeholder="Please describe how we can help you..."
                      required
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 bg-primary text-white hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2
                        ${isSubmitting ? 'opacity-50 cursor-not-allowed transform-none' : ''}`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send Message
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="bg-transparent hover:bg-secondary/10 text-secondary border-2 border-secondary font-semibold py-4 px-8 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                      onClick={() => {
                        setName('');
                        setEmail('');
                        setSubject('');
                        setMessage('');
                        setSubmissionError(null);
                        setSubmissionMessage(null);
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Clear Form
                    </button>
                  </div>

                  <p className="text-sm text-muted-foreground text-center">
                    We typically respond within 24 hours during business days.
                  </p>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;