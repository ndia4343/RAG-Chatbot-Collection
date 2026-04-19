
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AmzRAG | Amazon FAQ Assistant",
  description: "AI-powered RAG system for Amazon FAQs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0f1a] text-[#e2e8f0] antialiased`}>
        {/* This ensures the dark background from your mockup is applied globally */}
        {children}
      </body>
    </html>
  );
}
