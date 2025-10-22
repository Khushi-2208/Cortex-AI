import { ModeToggle } from "@/components/ThemeToggle";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FaGithub } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { SiLinkedin } from "react-icons/si";
import { FaHeart } from "react-icons/fa";
import './globals.css'


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cortex-AI",
  description: "A RAG chatbot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <html lang="en" suppressHydrationWarning>
        <head />
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ModeToggle />
            {children}
            <footer className="bg-blue-100 dark:bg-gray-900">
            <div className="px-4 py-6 bg-blue-200 dark:bg-gray-700 md:flex md:items-center md:justify-between">
            <span className="text-sm flex justify-center text-gray-500 dark:text-gray-300 sm:text-center ">© 2025 Cortex-AI. All Rights Reserved.
            </span>
            <div className="flex justify-center mt-1">Made with <FaHeart className="text-red-600 m-1 " /> by Khushi</div>
            <div className="flex mt-4 text-2xl justify-center sm:justify-center md:mt-0 space-x-5 rtl:space-x-reverse">
            <a href="https://github.com/Khushi-2208" className="light: text-gray-800 hover:text-blue-900 dark:hover:text-gray-900 dark:text-white">
                  <FaGithub />
              </a>
              <a href="khushikumari062205@gmail.com" className="light: text-gray-800 hover:text-blue-900 dark:hover:text-gray-900 dark:text-white">
                 <MdEmail />
              </a>
              <a href="https://www.linkedin.com/in/khushi-kumari-428a20334?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" className="light: text-gray-800 hover:text-blue-900 dark:hover:text-gray-900 dark:text-white">
               <SiLinkedin />
              </a>
            </div>
          </div>
          </footer>
          </ThemeProvider>
      </body>
    </html>
  );
}
