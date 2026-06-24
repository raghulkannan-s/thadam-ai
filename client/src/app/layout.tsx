import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";

export const metadata: Metadata = {
  title: "Thadam AI",
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
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
