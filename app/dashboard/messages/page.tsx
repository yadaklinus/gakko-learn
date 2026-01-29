// app/dashboard/page.tsx
"use client"
import { useSession } from "next-auth/react"
import StudentMessagesView from "@/components/dashboards/student/studentMessage"

export default function DashboardPage() {
  const { data: session } = useSession()
  const role = session?.user?.role

  // Show loading state
  // if (!session) {
  //   return <DashboardSkeleton />
  // }

  // Render based on role
  if (role === "STUDENT") {
    return <StudentMessagesView />
  }
  
  if (role === "TUTOR") {
     return <StudentMessagesView />
  }
  
  // if (role === "BOTH") {
  //   return <BothDashboard />
  // }

  return <div>Invalid role</div>
}