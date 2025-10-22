"use client"

import * as React from "react"
import { FaMoon, FaSun } from "react-icons/fa"
import { useTheme } from "next-themes"
import '../app/globals.css'
import Image from "next/image";
import AppLogo from "@/assets/AppLogo.png"
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogoutDialog } from "./LogoutDialog" 
import { useState } from 'react';

export function ModeToggle() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState<boolean>(false);
  const [mounted, setMounted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    if(typeof window !== "undefined"){
      const checkScreen = () => {
        const mobile = window.innerWidth < 640
        setIsMobile(mobile)
      }
      checkScreen();

      window.addEventListener("resize",checkScreen)
      return () => window.removeEventListener("resize",checkScreen)
    }
  },[])

  React.useEffect(() => setMounted(true),[]);
  if(!mounted) return null;

  const handleLogoutClick = (): void => {
    setIsLogoutDialogOpen(true);
  };

 const handleLogoutConfirm = async (): Promise<void> => {
    try {
      // Call the logout API
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
      });

      if (response.ok) {
        console.log('Logged out successfully');
        // Redirect to home page after successful logout
        window.location.href = '/';
      } else {
        console.error('Logout failed');
        alert('Failed to logout. Please try again.');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      alert('An error occurred during logout.');
    } finally {
      setIsLogoutDialogOpen(false);
    }
  };

  return (
        <>
        <div className={(pathname === '/login')|| (pathname === '/signup') ? "flex w-full bg-muted": "flex w-full"}>
        <Image src={AppLogo} alt="Cortex-ai_Logo" className="md:w-1/15 w-2/15 m-2"/>
         <div className="flex items-center gap-5 md:w-14/15 w-12/15 justify-end m-2 lg: mr-18">
        <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{ theme === "light" ?
          <FaSun className="text-yellow-400" />:
          <FaMoon className="text-white" />}
        </Button>
        {((pathname === '/') || (pathname === '/login') || (pathname === '/signup')) ? 
        (<><Link href= "/login"><Button variant="outline" size = {isMobile ? "sm" : "lg"} className=" dark:hover:bg-gray-600 light: bg-blue-400 light: text-white">log in</Button></Link>
        <Link href= "/signup"><Button variant="outline" size = {isMobile ? "sm" : "lg"} className=" dark:hover:bg-gray-600 light: bg-blue-400 light: text-white">sign up</Button></Link></>)
        :
        <div>
        <Button variant="outline" size = {isMobile ? "sm" : "lg"} onClick={handleLogoutClick} className=" dark:hover:bg-gray-600 light: bg-blue-400 light: text-white">log out</Button>
        <LogoutDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
      </div>
      }
        </div>
        </div>
        </>
  )
}
