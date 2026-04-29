import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skillforge — The Company Brain for AI Agents",
  description:
    "Skillforge turns your scattered company knowledge — Slack, Notion, Drive, GitHub — into executable skills that AI agents can actually run. Stop pasting context. Start shipping agents.",
  metadataBase: new URL("https://skillforge-provibecodes-projects.vercel.app"),
  openGraph: {
    title: "Skillforge — The Company Brain for AI Agents",
    description:
      "Turn scattered company knowledge into executable skills your agents can run.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skillforge — The Company Brain for AI Agents",
    description:
      "Turn scattered company knowledge into executable skills your agents can run.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "hsl(0 0% 8%)",
              border: "1px solid hsl(0 0% 14%)",
              color: "hsl(0 0% 98%)",
            },
          }}
        />
      </body>
    </html>
  );
}
