// components/ModalPortal.tsx
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
}

const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render null on the server side or until the DOM is ready
  if (!mounted) {
    return null;
  }

  // Create a div element and append it to the document body
  // You can also use a pre-defined element in your root layout if you prefer
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    console.error("Could not find modal root element in the DOM.");
    return null; // Or handle this error appropriately
  }

  return createPortal(children, modalRoot);
};

export default ModalPortal;