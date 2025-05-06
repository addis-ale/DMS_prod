import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import Providers from "./provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SiteTrack | Construction Project Management",
  description:
    "Streamline your construction projects with real-time site data tracking, document management, and team collaboration tools for contractors and project managers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div>{children}</div>
        </Providers>
        <Toaster richColors />
      </body>
    </html>
  );
}
