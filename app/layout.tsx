import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flight Ops Monitor",
  description: "Airline-style flight operations monitoring dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}