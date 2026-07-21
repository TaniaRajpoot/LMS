import type { Metadata } from "next";
import { Poppins, Josefin_Sans } from "next/font/google";
import { ThemeProvider } from "./utils/theme-provider";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-josefin",
});
export const metadata: Metadata = {
  title: "E-Learning",
  description: "LMS Platform",
  keywords: ["E-Learning", "LMS", "Platform"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${josefin.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className={`${poppins.className} ${josefin.className} bg-white bg-no-repeat dark:bg-linear-to-b dark:from-gray-900 dark:to-black duration-300 min-h-screen`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
