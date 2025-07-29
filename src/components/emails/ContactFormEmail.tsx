import React from 'react';

interface ContactFormEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactFormEmail: React.FC<Readonly<ContactFormEmailProps>> = ({
  name,
  email,
  subject,
  message,
}) => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
      <h1 style={{ color: '#1a1a1a' }}>New Message from Your Website&apos;s Contact Form</h1>
      <p>You have received a new submission. Here are the details:</p>
      <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />
      <div style={{ marginTop: '20px' }}>
        <p><strong>From:</strong> {name}</p>
        <p><strong>Email:</strong> <a href={`mailto:${email}`}>{email}</a></p>
        <p><strong>Subject:</strong> {subject}</p>
      </div>
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h3 style={{ marginTop: '0', color: '#1a1a1a' }}>Message:</h3>
        <p style={{ whiteSpace: 'pre-wrap', margin: '0' }}>{message}</p>
      </div>
      <hr style={{ marginTop: '20px', border: 'none', borderTop: '1px solid #eee' }} />
      <p style={{ fontSize: '12px', color: '#777' }}>
        This email was sent from the contact form on your website. You can reply directly to this email to contact the sender.
      </p>
    </div>
  );
};

export default ContactFormEmail;