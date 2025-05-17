"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Header/Navbar";
import Footer from "./Footer/Footer";
import { NotificationProvider } from "./Components/NotificationContext";

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // Hide Navbar and Footer on signin and signup pages
  if (pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")) {
    return <>{children}</>;
  }

  return (
    <NotificationProvider>
      <>
        <Navbar />
        <main className="min-h-[calc(100vh-64px)] flex flex-col pt-20">
          {children}
        </main>
        <Footer />
      </>
    </NotificationProvider>
  );
};

export default LayoutWrapper;
