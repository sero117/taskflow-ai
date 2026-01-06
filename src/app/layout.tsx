import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "تاسك فلو | TaskFlow",
  description: "إدارة المهام بذكاء وسهولة",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning هنا ضرورية لأن next-themes تعدل على وسم html
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        // إضافة suppressHydrationWarning هنا أيضاً لتجاهل تعديلات إضافات المتصفح (مثل Liner)
        suppressHydrationWarning
      >
        <LanguageProvider>
          {/* نصيحة: ThemeProvider يفضل أن يكون له enableSystem للسماح بالتوافق مع إعدادات الجهاز */}
          <ThemeProvider 
            attribute="class" 
            defaultTheme="light" 
            enableSystem={false}
          >
            {children}
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}