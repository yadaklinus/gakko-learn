"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Calendar, 
  Star, 
  MessageSquare, 
  Shield, 
  UserX, 
  UserCheck, 
  Trash2,
  Clock
} from "lucide-react";
import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";
import AdminDataTable from "@/components/admin/AdminDataTable";

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/admin/users/${id}`);
        if (!res.ok) throw new Error("User not found");
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error(error);
        router.push("/admin/users");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [id, router]);

  const toggleSuspension = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isSuspended: !user.isSuspended }),
        headers: { "Content-Type": "application/json" },
      });
      const updated = await res.json();
      setUser({ ...user, isSuspended: updated.isSuspended });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteUser = async () => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      router.push("/admin/users");
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading user profile...</div>;
  if (!user) return null;

  const bookingColumns = [
    { header: "Subject", accessor: "subject" },
    { header: "Date", accessor: (b: any) => new Date(b.date).toLocaleDateString() },
    { header: "Status", accessor: (b: any) => <StatusBadge status={b.status} /> },
  ];

  const logColumns = [
    { header: "Action", accessor: (l: any) => <StatusBadge status={l.action} /> },
    { header: "Entity", accessor: "entity" },
    { header: "Date", accessor: (l: any) => new Date(l.createdAt).toLocaleString() },
  ];

  return (
    <div className="space-y-8">
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Profile Card */}
        <div className="lg:w-80 space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 text-center backdrop-blur-sm">
            <div className="relative inline-block mb-4">
              {user.image ? (
                <img src={user.image} className="w-24 h-24 rounded-2xl object-cover border-4 border-gray-800" alt={user.name} />
              ) : (
                <div className="w-24 h-24 bg-gray-800 rounded-2xl flex items-center justify-center text-3xl font-bold">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2">
                <StatusBadge status={user.role} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-sm text-gray-500 mb-6">{user.email}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Rating</p>
                <div className="flex items-center justify-center gap-1 text-sm font-bold text-amber-400">
                  <Star className="w-3 h-3 fill-current" />
                  {user.rating.toFixed(1)}
                </div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Reviews</p>
                <p className="text-sm font-bold text-white">{user.totalReviews}</p>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={toggleSuspension}
                className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-medium transition-all ${
                  user.isSuspended 
                    ? "bg-green-600/10 text-green-400 hover:bg-green-600/20" 
                    : "bg-amber-600/10 text-amber-400 hover:bg-amber-600/20"
                }`}
              >
                {user.isSuspended ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                {user.isSuspended ? "Unsuspend Account" : "Suspend Account"}
              </button>
              <button 
                onClick={deleteUser}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-red-600/10 text-red-400 hover:bg-red-600/20 font-medium transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete Permanently
              </button>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Account Info</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Institution</p>
                <p className="text-sm text-gray-300">{user.institution || "Not specified"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Member Since</p>
                <p className="text-sm text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              {user.bio && (
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Bio</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{user.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Tabs and Activity */}
        <div className="flex-1 space-y-6">
          <div className="flex gap-4 border-b border-gray-800 pb-px">
            {["bookings", "activity"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium transition-all relative ${
                  activeTab === tab ? "text-indigo-400" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {activeTab === "bookings" && (
            <AdminDataTable 
              columns={bookingColumns} 
              data={user.role === "STUDENT" ? user.bookingsAsStudent : user.bookingsAsTutor} 
              emptyMessage="No bookings found for this user."
            />
          )}

          {activeTab === "activity" && (
            <AdminDataTable 
              columns={logColumns} 
              data={user.activityLogs} 
              emptyMessage="No activity logs found."
            />
          )}
        </div>
      </div>
    </div>
  );
}
