import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import QueryProvider from "@/components/QueryProvider";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Recursive } from "next/font/google";
import "./globals.css";

const recursive = Recursive({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Snapcase",
  description: "Get your custom phone case.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={recursive.className}>
        <Navbar />{" "}
        <main className="flex flex-col min-h-[calc(100vh-3.5rem-1px)] grainy-light">
          <div className="flex-1 flex flex-col h-full">
            <QueryProvider>{children}</QueryProvider>
          </div>
          <Footer />
        </main>
        <Toaster />
      </body>
    </html>
  );
}
