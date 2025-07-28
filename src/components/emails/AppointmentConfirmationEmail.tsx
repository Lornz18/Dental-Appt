import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

// This is a simplified interface. Make sure it matches your Appointment model.
interface Appointment {
  _id: string;
  patientName: string;
  appointmentDate: Date;
  appointmentTime: string;
  reason: string;
  durationMinutes?: number;
}

interface AppointmentConfirmationEmailProps {
  appointment: Appointment;
}

export const AppointmentConfirmationEmail: React.FC<Readonly<AppointmentConfirmationEmailProps>> = ({
  appointment,
}) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeZone: 'UTC', // Make sure to handle timezones appropriately
  }).format(appointment.appointmentDate);

  const appointmentUrl = `https://dental-appt.vercel.app/appointment/${appointment._id}`;

  return (
    <Html>
      <Head />
      <Preview>Your Appointment is Confirmed - {formattedDate} at {appointment.appointmentTime}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Section */}
          <Section style={headerSection}>
            <Heading style={heading}>✅ Appointment Confirmed</Heading>
            <Text style={subheading}>
              Your dental appointment has been successfully scheduled
            </Text>
          </Section>

          {/* Greeting */}
          <Section style={contentSection}>
            <Text style={greeting}>Hello {appointment.patientName},</Text>
            <Text style={paragraph}>
              Great news! Your appointment has been confirmed. We&apos;re looking forward to seeing you.
            </Text>
          </Section>

          {/* Appointment Details Card */}
          <Section style={detailsCard}>
            <Heading style={cardHeading}>Appointment Details</Heading>
            
            <Section style={detailRow}>
              <Text style={detailLabel}>📅 Date</Text>
              <Text style={detailValue}>{formattedDate}</Text>
            </Section>

            <Section style={detailRow}>
              <Text style={detailLabel}>🕒 Time</Text>
              <Text style={detailValue}>{appointment.appointmentTime}</Text>
            </Section>

            <Section style={detailRow}>
              <Text style={detailLabel}>🦷 Service</Text>
              <Text style={detailValue}>{appointment.reason}</Text>
            </Section>

            {appointment.durationMinutes && (
              <Section style={detailRow}>
                <Text style={detailLabel}>⏱️ Duration</Text>
                <Text style={detailValue}>{appointment.durationMinutes} minutes</Text>
              </Section>
            )}
          </Section>

          {/* Action Button */}
          <Section style={buttonSection}>
            <Button style={button} href={appointmentUrl}>
              View Appointment Details
            </Button>
          </Section>

          {/* Important Information */}
          <Section style={infoSection}>
            <Text style={infoHeading}>Important Information</Text>
            <Text style={infoParagraph}>
              • Please arrive 15 minutes before your scheduled time<br/>
              • Bring a valid ID and insurance card<br/>
              • If you need to reschedule, please contact us at least 24 hours in advance
            </Text>
          </Section>

          {/* Contact Information */}
          <Section style={contactSection}>
            <Text style={contactHeading}>Need to make changes?</Text>
            <Text style={contactText}>
              You can view or manage your appointment by clicking the button above, or contact us directly.
            </Text>
            <Button style={secondaryButton} href={appointmentUrl}>
              Manage Appointment
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Thank you for choosing our dental practice. We&apos;re committed to providing you with excellent care.
            </Text>
            <Text style={footerSmall}>
              This is an automated confirmation email. Please do not reply to this message.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AppointmentConfirmationEmail;

// Responsive and modern styling
const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: '0',
  padding: '0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  width: '100%',
  maxWidth: '600px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  overflow: 'hidden',
};

const headerSection = {
  backgroundColor: '#3b82f6',
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const heading = {
  fontSize: '28px',
  lineHeight: '1.2',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0 0 8px 0',
};

const subheading = {
  fontSize: '16px',
  lineHeight: '1.4',
  color: '#e0e7ff',
  margin: '0',
  fontWeight: '400',
};

const contentSection = {
  padding: '32px 24px 0 24px',
};

const greeting = {
  fontSize: '18px',
  lineHeight: '1.4',
  color: '#1f2937',
  margin: '0 0 16px 0',
  fontWeight: '600',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#4b5563',
  margin: '0 0 24px 0',
};

const detailsCard = {
  margin: '24px 24px 0 24px',
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '24px',
};

const cardHeading = {
  fontSize: '20px',
  lineHeight: '1.3',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 20px 0',
};

const detailRow = {
  marginBottom: '16px',
  borderBottom: '1px solid #e5e7eb',
  paddingBottom: '12px',
};

const detailLabel = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#6b7280',
  margin: '0 0 4px 0',
};

const detailValue = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0',
};

const buttonSection = {
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  border: 'none',
  cursor: 'pointer',
  lineHeight: '1',
};

const secondaryButton = {
  backgroundColor: '#f3f4f6',
  borderRadius: '6px',
  color: '#374151',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 20px',
  border: '1px solid #d1d5db',
  cursor: 'pointer',
  lineHeight: '1',
  marginTop: '12px',
};

const infoSection = {
  margin: '0 24px 24px 24px',
  padding: '20px',
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '6px',
};

const infoHeading = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#92400e',
  margin: '0 0 12px 0',
};

const infoParagraph = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#92400e',
  margin: '0',
};

const contactSection = {
  padding: '24px',
  textAlign: 'center' as const,
  backgroundColor: '#f9fafb',
  borderTop: '1px solid #e5e7eb',
};

const contactHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 8px 0',
};

const contactText = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#6b7280',
  margin: '0',
};

const footer = {
  padding: '24px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e5e7eb',
};

const footerText = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#6b7280',
  margin: '0 0 12px 0',
};

const footerSmall = {
  fontSize: '12px',
  lineHeight: '1.4',
  color: '#9ca3af',
  margin: '0',
};