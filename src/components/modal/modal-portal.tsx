// components/ModalPortal.tsx
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
  isOpen: boolean; // Add the isOpen prop
  // Optionally, you could add an onClose prop here if the modal itself needs to close itself
  // onClose?: () => void;
}

const ModalPortal: React.FC<ModalPortalProps> = ({ children, isOpen }) => {
  const [isMounted, setIsMounted] = useState(false); // Renamed for clarity to distinguish from portal's existence

  useEffect(() => {
    // This effect ensures the portal logic runs only on the client side
    setIsMounted(true);
  }, []);

  // If the modal is not open, or if we are still on the server side (isMounted is false),
  // then don't render anything.
  if (!isMounted || !isOpen) {
    return null;
  }

  // Find the root element where the portal should be attached.
  // This element must exist in your main HTML file (e.g., public/index.html or in your _document.tsx/layout.tsx)
  const modalRoot = document.getElementById('modal-root');

  // If the modal root element is not found, log an error and return null.
  // This is a critical error, as the portal cannot be created without its target.
  if (!modalRoot) {
    console.error("ModalPortal: Could not find modal root element with id 'modal-root' in the DOM.");
    return null;
  }

  // Use createPortal to render the children into the modalRoot element.
  // This effectively moves the modal's DOM nodes out of the component's natural
  // position in the React tree and into the designated modal root, which is
  // typically a direct child of the <body> tag.
  return createPortal(children, modalRoot);
};

export default ModalPortal;