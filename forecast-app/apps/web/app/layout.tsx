import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@workspace/ui/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "UK Wind Forecast Monitor",
  description:
    "Visualise actual vs. forecasted UK national wind power generation with configurable forecast horizons. Data sourced from Elexon BMRS API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-[#0b0f1a] font-sans antialiased">{children}</body>
    </html>
  );
}
