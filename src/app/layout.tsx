import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "SDS - Football Culture",
  description: "The home of football culture — debates, banter, reactions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="text-white">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
