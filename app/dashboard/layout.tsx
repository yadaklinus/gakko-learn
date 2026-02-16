"use client"

import { Navigation } from "@/components/navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react"; // ADD THIS

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {status} = useSession()
  const router = useRouter()
  
  // ADD THIS EFFECT
  useEffect(() => {
    if (typeof window !== 'undefined' && status === "unauthenticated") {
      router.replace("/auth/login")
    }
  }, [status, router])
  
  if(status == "loading"){
    return ""
  }
  
  return (
   <>
      <div className="min-h-screen bg-slate-50">
      <div className="md:pl-72 transition-all duration-300">
        <main className="max-w-5xl mx-auto min-h-screen bg-white md:shadow-sm relative z-0">
          <div className="p-6 md:p-10 pb-32 md:pb-10">
            {children}
          </div>
        </main>
      </div>
      <Navigation />
    </div>
   </>
  );
}