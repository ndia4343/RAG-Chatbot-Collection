import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from 'next-themes';

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
    // suppressHydrationWarning is required when using next-themes
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#0a0f1a] text-[#e2e8f0] antialiased`}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem={false} // Keeps your specific dark aesthetic as default
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
