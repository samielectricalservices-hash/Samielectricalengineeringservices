import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Sami Electrical MSMS",
  description: "Motor Service Management System",
  verification: {
    google: "1jWMcXY10rg8YjBmBEfhznQTrNChtFz_zwt6N3MGhww"
  },
  icons: {
    icon: "/logo1.jpg",
    apple: "/logo1.jpg"
  }
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
