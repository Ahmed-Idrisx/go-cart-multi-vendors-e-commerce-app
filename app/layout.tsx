import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import StoreProvider from "./StoreProvider";
import { ClerkProvider } from "@clerk/nextjs";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "GoCart. - Shop smarter",
  description: "GoCart. - Shop smarter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${outfit.className} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <StoreProvider>
              <Toaster />
              {children}
            </StoreProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
