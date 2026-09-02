import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HEXAGON | Learning that changes shape",
  description: "A polymorphic learning interface that adapts to your cognitive state in real-time.",
};

export const viewport: Viewport = {
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-hexagon-accent selection:text-black">
        {children}
      </body>
    </html>
  );
}
