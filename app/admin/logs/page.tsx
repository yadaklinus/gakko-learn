"use client";

import { useState, useEffect } from "react";
import { Search, History, User, Activity, Clock, Filter } from "lucide-react";
import AdminDataTable from "@/components/admin/AdminDataTable";
import StatusBadge from "@/components/admin/StatusBadge";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, userSearch]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "100",
      });
      if (actionFilter !== "ALL") params.append("action", actionFilter);
      if (userSearch) params.append("userId", userSearch); // Simple search for now

      const res = await fetch(`/api/admin/logs?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      header: "Timestamp",
      accessor: (l: any) => (
        <div className="flex items-center gap-2 text-gray-400">
          <Clock className="w-3 h-3" />
          <span className="text-xs">{new Date(l.createdAt).toLocaleString()}</span>
        </div>
      ),
    },
    {
      header: "User",
      accessor: (l: any) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-[10px] font-bold">
            {l.user?.name?.charAt(0) || "S"}
          </div>
          <span className="text-sm font-medium">{l.user?.name || "System"}</span>
        </div>
      ),
    },
    {
      header: "Action",
      accessor: (l: any) => <StatusBadge status={l.action} />,
    },
    {
      header: "Entity",
      accessor: (l: any) => (
        <div className="text-xs">
          <span className="text-gray-300 font-bold">{l.entity}</span>
          {l.entityId && <span className="text-gray-600 block truncate max-w-[150px]">{l.entityId}</span>}
        </div>
      ),
    },
    {
      header: "Metadata",
      accessor: (l: any) => (
        <div className="text-[10px] text-gray-500 max-w-xs truncate">
          {l.metadata || "-"}
        </div>
      ),
    },
  ];

  const actions = [
    "ALL",
    "USER_CREATED",
    "USER_UPDATED",
    "USER_DELETED",
    "BOOKING_CREATED",
    "BOOKING_CONFIRMED",
    "BOOKING_CANCELLED",
    "CONNECTION_REQUESTED",
    "CONNECTION_ACCEPTED",
    "ADMIN_USER_UPDATED",
    "ADMIN_TICKET_CREATED",
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Activity Audit Logs</h1>
        <p className="text-gray-400">Complete history of system and user actions for security and auditing.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-gray-900/50 p-4 rounded-2xl border border-gray-800 backdrop-blur-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by User ID..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            className="bg-transparent text-sm text-gray-300 focus:outline-none"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            {actions.map(a => <option key={a} value={a} className="bg-gray-900">{a}</option>)}
          </select>
        </div>
      </div>

      <AdminDataTable columns={columns} data={logs} isLoading={isLoading} emptyMessage="No logs found for selected filters." />
    </div>
  );
}
