import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AdminLayout from "./layout-client";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FoodieExpress - Master Admin",
  description: "Advanced Operations Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdminLayout>{children}</AdminLayout>
      </body>
    </html>
  );
}
