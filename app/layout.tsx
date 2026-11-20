import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LMS SMK Citra Negara",
  description: "Learning Management System SMK Citra Negara",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
