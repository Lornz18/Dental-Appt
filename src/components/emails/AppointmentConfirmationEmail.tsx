import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';

// This is a simplified interface. Make sure it matches your Appointment model.
interface Appointment {
  patientName: string;
  appointmentDate: Date;
  appointmentTime: string;
  reason: string;
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

  return (
    <Html>
      <Head />
      <Preview>Your Appointment is Confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Appointment Confirmation</Heading>
          <Text style={paragraph}>Hello {appointment.patientName},</Text>
          <Text style={paragraph}>
            This is to confirm that your appointment has been successfully scheduled.
          </Text>
          <Text style={details}>
            <strong>Service:</strong> {appointment.reason}
            <br />
            <strong>Date:</strong> {formattedDate}
            <br />
            <strong>Time:</strong> {appointment.appointmentTime}
          </Text>
          <Text style={paragraph}>
            We look forward to seeing you. If you need to reschedule, please contact us.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default AppointmentConfirmationEmail;

// Basic styling
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
};

const heading = {
  fontSize: '24px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#484848',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.4',
  color: '#484848',
};

const details = {
  ...paragraph,
  padding: '12px',
  backgroundColor: '#f2f3f3',
  borderRadius: '4px',
}