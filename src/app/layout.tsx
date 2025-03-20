import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/store/store-provider";
import { ThemeProvider } from "next-themes";
import { TimeZoneProvider } from "@/components/schedule/time-zone-context";
import { Toaster } from "sonner";
import { connectToMongoDB } from "@/lib/mongodb";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  connectToMongoDB();

  return (
    <html lang="en">
      <ReduxProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Toaster />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TimeZoneProvider>{children}</TimeZoneProvider>
          </ThemeProvider>
        </body>
      </ReduxProvider>
    </html>
  );
}
