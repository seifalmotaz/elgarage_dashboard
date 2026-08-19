import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "../lib/contexts/AuthContext";
import { QueryProvider } from "../lib/providers/QueryProvider";

const madaniArabic = localFont({
  src: [
    {
      path: "../public/fonts/MadaniArabic-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/fonts/MadaniArabic-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/fonts/MadaniArabic-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/MadaniArabic-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/MadaniArabic-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/MadaniArabic-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/MadaniArabic-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/MadaniArabic-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../public/fonts/MadaniArabic-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-madani",
});

export const metadata: Metadata = {
  title: "elGARAGE - لوحة التحكم",
  description: "تسجيل الدخول إلى لوحة تحكم elGARAGE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${madaniArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
