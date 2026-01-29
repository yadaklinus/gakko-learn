// app/dashboard/page.tsx
"use client"
import { useSession } from "next-auth/react"
import StudentExploreView from "@/components/dashboards/student/studentExplore"
import TutorExploreView from "@/components/dashboards/totuor/toutorExplore"
export default function DashboardPage() {
  const { data: session } = useSession()
  const role = session?.user?.role

  // Show loading state
  // if (!session) {
  //   return <DashboardSkeleton />
  // }

  // Render based on role
  if (role === "STUDENT") {
    return <StudentExploreView />
  }
  
  if (role === "TUTOR") {
    return <TutorExploreView />
  }
  
  // if (role === "BOTH") {
  //   return <BothDashboard />
  // }

  return <div>Invalid role</div>
}