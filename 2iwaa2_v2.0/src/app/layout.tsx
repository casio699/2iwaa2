import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "2iwa2 - منصة إيواء",
  description: "منصة لمساعدة النازحين في لبنان: مراكز إيواء، مساكن، تنبيهات، وبلاغات.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
