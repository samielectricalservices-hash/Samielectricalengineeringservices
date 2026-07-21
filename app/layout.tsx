import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "MSMS",
  description: "Motor Service Management System"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
