import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import AuthProvider from "@/components/shared/AuthProvider";
import NavbarWrapper from "@/components/shared/NavbarWrapper";
import Footer from "@/components/shared/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexora",
  description: "Modern E-Commerce Store",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
              <div className="min-h-screen flex flex-col bg-white">

                <NavbarWrapper />
          
      <main className="flex-1">{children}</main>
          <Toaster position="top-right" richColors />
      <Footer />
        </div>

        </AuthProvider>
      </body>
    </html>
  );
}