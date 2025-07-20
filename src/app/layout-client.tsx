// app/layout-client.tsx
"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/header/header"; // Ensure this path is correct
import { Toaster } from 'react-hot-toast'; // Keep Toaster here or move to RootLayout if it's global

// This component will render the Header conditionally
const LayoutClientWrapper = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const [showHeader, setShowHeader] = useState(true); // Default to true

  useEffect(() => {
    // Check if the current path starts with /admin
    // Using startsWith accounts for /admin, /admin/login, /admin/dashboard etc.
    if (pathname.startsWith("/admin")) {
      setShowHeader(false);
    } else {
      setShowHeader(true);
    }
  }, [pathname]);

  // You can also include the Toaster here if you want it to be part of the client logic
  // Or keep it in the RootLayout if it needs to be universally available server-side.
  // If Toaster relies on client-side rendering (which it does), it's better here.
  return (
    <>
      {/* Toaster should generally be on the client side */}
      <div id="modal-root" className="relative z-50"></div>
      <Toaster position="top-right" reverseOrder={false} />
      {showHeader && <Header />}
      {children}
    </>
  );
};

export default LayoutClientWrapper;