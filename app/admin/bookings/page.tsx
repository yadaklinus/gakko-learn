"use client";

import { useState, useEffect } from "react";
import { Search, Calendar, User, Clock, MapPin, MoreVertical, XCircle, CheckCircle } from "lucide-react";
import AdminDataTable from "@/components/admin/AdminDataTable";
import StatusBadge from "@/components/admin/StatusBadge";

export default function BookingsMonitoringPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings?status=${statusFilter}`);
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
        headers: { "Content-Type": "application/json" },
      });
      fetchBookings();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    {
      header: "Session",
      accessor: (b: any) => (
        <div>
          <p className="font-bold text-white">{b.subject}</p>
          <p className="text-xs text-gray-500">{b.topic || "No topic"}</p>
        </div>
      ),
    },
    {
      header: "Student",
      accessor: (b: any) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center text-[10px] font-bold">
            {b.student?.name.charAt(0)}
          </div>
          <span className="text-sm">{b.student?.name}</span>
        </div>
      ),
    },
    {
      header: "Tutor",
      accessor: (b: any) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center text-[10px] font-bold">
            {b.tutor?.name.charAt(0)}
          </div>
          <span className="text-sm">{b.tutor?.name}</span>
        </div>
      ),
    },
    {
      header: "Date & Time",
      accessor: (b: any) => (
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1 text-gray-300">
            <Calendar className="w-3 h-3 text-indigo-400" />
            {new Date(b.date).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="w-3 h-3" />
            {new Date(b.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({b.duration}m)
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (b: any) => <StatusBadge status={b.status} />,
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (b: any) => (
        <div className="flex items-center justify-end gap-2">
          {b.status === "PENDING" && (
            <button 
              onClick={() => updateStatus(b.id, "CONFIRMED")}
              className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
              title="Confirm Session"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {b.status !== "CANCELLED" && b.status !== "COMPLETED" && (
            <button 
              onClick={() => updateStatus(b.id, "CANCELLED")}
              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Cancel Session"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Session Monitoring</h1>
        <p className="text-gray-400">Track and manage all tutoring sessions across the platform.</p>
      </div>

      <div className="flex gap-2 p-1 bg-gray-900 border border-gray-800 rounded-xl w-fit">
        {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              statusFilter === status 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <AdminDataTable columns={columns} data={bookings} isLoading={isLoading} emptyMessage="No bookings found." />
    </div>
  );
}
