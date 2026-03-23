import { 
  Users, 
  Calendar, 
  Ticket, 
  Star, 
  TrendingUp, 
  Activity 
} from "lucide-react";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { prisma } from "@/lib/prisma";

async function getStats() {
  const [
    totalUsers,
    totalBookings,
    openTickets,
    totalTutors
  ] = await Promise.all([
    prisma.user.count(),
    prisma.booking.count(),
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
    prisma.user.count({ where: { role: { in: ["BOTH"] } } }),
  ]);

  const recentLogs = await prisma.activityLog.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, image: true } } }
  });

  const topTutors = await prisma.user.findMany({
    where: { role: "BOTH" },
    orderBy: { rating: "desc" },
    take: 5,
    select: { name: true, rating: true, totalReviews: true, image: true }
  });

  return {
    totalUsers,
    totalBookings,
    openTickets,
    totalTutors,
    recentLogs,
    topTutors
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Overview Dashboard</h1>
        <p className="text-gray-400">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard 
          label="Total Users" 
          value={stats.totalUsers} 
          icon={Users} 
          trend={{ value: 12, isUp: true }}
          color="indigo"
        />
        <AdminStatCard 
          label="Total Bookings" 
          value={stats.totalBookings} 
          icon={Calendar} 
          trend={{ value: 5, isUp: true }}
          color="blue"
        />
        <AdminStatCard 
          label="Open Tickets" 
          value={stats.openTickets} 
          icon={Ticket} 
          color="amber"
        />
        <AdminStatCard 
          label="Total Tutors" 
          value={stats.totalTutors} 
          icon={Star} 
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Recent Activity
            </h3>
            <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">View all logs</button>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="divide-y divide-gray-800">
              {stats.recentLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center gap-4 hover:bg-gray-800/30 transition-colors">
                  <div className={`p-2 rounded-lg ${
                    log.action.includes('CREATED') ? 'bg-green-500/10 text-green-400' :
                    log.action.includes('DELETED') ? 'bg-red-500/10 text-red-400' :
                    'bg-indigo-500/10 text-indigo-400'
                  }`}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      <span className="text-white">{log.user?.name || 'System'}</span>{" "}
                      <span className="text-gray-400 text-xs lowercase">{log.action.replace('_', ' ')}</span>{" "}
                      <span className="text-gray-300">{log.entity}</span>
                    </p>
                    <p className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {stats.recentLogs.length === 0 && (
                <div className="p-8 text-center text-gray-500">No recent activity</div>
              )}
            </div>
          </div>
        </div>

        {/* Top Tutors */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Top Tutors
          </h3>
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
            {stats.topTutors.map((tutor, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="relative">
                  {tutor.image ? (
                    <img src={tutor.image} className="w-12 h-12 rounded-xl object-cover" alt={tutor.name} />
                  ) : (
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center font-bold">
                      {tutor.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-gray-900">
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{tutor.name}</p>
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{tutor.rating.toFixed(1)}</span>
                    <span className="text-gray-500 ml-1">({tutor.totalReviews} reviews)</span>
                  </div>
                </div>
              </div>
            ))}
            {stats.topTutors.length === 0 && (
              <div className="text-center text-gray-500">No tutors found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
