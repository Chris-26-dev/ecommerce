import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

const jostMono = Jost({
  variable: "--font-jost-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChrisAir | E-commerce",
  description: "An e-commerce platform for ChrisAir shoes",
  icons: {
    icon: "/logo.svg",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jost.variable} ${jostMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
