import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Thadam AI — Turn AI Roadmaps Into Actionable Checklists",
  description:
    "Generate AI-powered learning roadmaps, break them into checklists, and track your progress with streaks and accountability. Built for consistency.",
  keywords: [
    "AI roadmap",
    "learning checklist",
    "study tracker",
    "accountability",
    "AI learning",
  ],
  openGraph: {
    title: "Thadam AI — AI Learning Roadmaps",
    description:
      "Generate structured learning roadmaps with AI. Track progress with checklists and streaks.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(!t){t=window.matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
