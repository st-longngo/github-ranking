import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import QueryProvider from "@/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GitHub Language Rankings",
    template: "%s | GitHub Language Rankings",
  },
  description:
    "Real-time ranking of programming languages by GitHub activity — repositories, stars, forks, and commit momentum. Compare JavaScript, Python, TypeScript, Rust, Go, and 25+ more.",
  keywords: [
    "GitHub language rankings",
    "programming language popularity",
    "GitHub statistics",
    "top programming languages",
    "developer trends",
    "open source rankings",
  ],
  authors: [{ name: "GitHub Language Rankings" }],
  creator: "GitHub Language Rankings",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: "GitHub Language Rankings",
    description:
      "Real-time ranking of programming languages by GitHub activity — repositories, stars, forks, and commit momentum.",
    type: "website",
    locale: "en_US",
    siteName: "GitHub Language Rankings",
  },
  twitter: {
    card: "summary",
    title: "GitHub Language Rankings",
    description:
      "Real-time ranking of programming languages by GitHub activity — repositories, stars, forks, and commit momentum.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <QueryProvider>
          <Header />
          <main className="flex-1">{children}</main>
          {/* <Footer /> */}
        </QueryProvider>
      </body>
    </html>
  );
}
