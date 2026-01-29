// app/dashboard/page.tsx
"use client"
import { useSession } from "next-auth/react"
import StudentHomeView from "@/components/dashboards/student/studentDashboard"
import TutorHomeView from "@/components/dashboards/totuor/toutorDashboard"

export default function DashboardPage() {
  const { data: session } = useSession()
  const role = session?.user?.role

  console.log(session)

  // Show loading state
  // if (!session) {
  //   return <DashboardSkeleton />
  // }

  // Render based on role
  if (role === "STUDENT") {
    return <StudentHomeView />
  }
  
  if (role === "TUTOR") {
    return <TutorHomeView />
  }
  
  // if (role === "BOTH") {
  //   return <BothDashboard />
  // }

  return <div>Invalid role</div>
}