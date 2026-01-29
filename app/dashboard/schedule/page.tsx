// app/dashboard/page.tsx
"use client"
import { useSession } from "next-auth/react"
import StudentScheduleView from "@/components/dashboards/student/studentSchedule"
import TutorScheduleView from "@/components/dashboards/totuor/toutorSchedule"
export default function DashboardPage() {
  const { data: session } = useSession()
  const role = session?.user?.role

  // Show loading state
  // if (!session) {
  //   return <DashboardSkeleton />
  // }

  // Render based on role
  if (role === "STUDENT") {
    return <StudentScheduleView />
  }
  
  if (role === "TUTOR") {
    return <TutorScheduleView />
  }
  
  // if (role === "BOTH") {
  //   return <BothDashboard />
  // }

  return <div>Invalid role</div>
}