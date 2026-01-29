"use client"

import { Navigation } from "@/components/navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {status} = useSession()
  const router = useRouter()
  if(status == "loading"){
    return ""
  }
   if(status == "unauthenticated"){
           
                router.replace("/auth/login")
                console.log("not auth")
            
        }
  return (
   <>
      <div className="min-h-screen bg-slate-50">
      {/* FIX 1: Change md:pl-60 to md:pl-72 
         This matches the w-72 (288px) width of your Desktop Sidebar 
      */}
      <div className="md:pl-72 transition-all duration-300">
        
        {/* FIX 2: Ensure relative positioning and z-0
           This ensures content stays behind the fixed z-50 navigation 
        */}
        <main className="max-w-5xl mx-auto min-h-screen bg-white md:shadow-sm relative z-0">
          
          {/* Content Wrapper */}
          <div className="p-6 md:p-10 pb-32 md:pb-10">
            {children}
          </div>
          
        </main>
      </div>

      {/* Navigation is Fixed (z-50), sitting on top */}
      <Navigation />
    </div>
          
     </>
  );
}