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
        
        <div className="min-h-screen bg-slate-50 md:pl-64">
            <div className="max-w-5xl mx-auto min-h-screen bg-white md:shadow-sm pb-24 md:pb-8 relative">
              {children}
            </div>
        </div>
        <Navigation />
          
     </>
  );
}