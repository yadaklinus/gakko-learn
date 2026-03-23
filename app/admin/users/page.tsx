"use client";

import { useState, useEffect } from "react";
import { Search, Plus, MoreVertical, Shield, UserX, UserCheck, Trash2, Eye } from "lucide-react";
import AdminDataTable from "@/components/admin/AdminDataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import Link from "next/link";

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        role: roleFilter,
      });
      const res = await fetch(`/api/admin/users?${query}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSuspension = async (userId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ isSuspended: !currentStatus }),
        headers: { "Content-Type": "application/json" },
      });
      fetchUsers();
    } catch (error) {
      console.error("Failed to toggle suspension:", error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action is irreversible.")) return;
    try {
      await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const columns = [
    {
      header: "User",
      accessor: (user: any) => (
        <div className="flex items-center gap-3">
          {user.image ? (
            <img src={user.image} className="w-8 h-8 rounded-full" alt={user.name} />
          ) : (
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-xs font-bold">
              {user.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-medium text-white">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: (user: any) => <StatusBadge status={user.role} />,
    },
    {
      header: "Status",
      accessor: (user: any) => (
        <StatusBadge status={user.isSuspended ? "SUSPENDED" : "ACTIVE"} />
      ),
    },
    {
      header: "Joined",
      accessor: (user: any) => new Date(user.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (user: any) => (
        <div className="flex items-center justify-end gap-2">
          <Link 
            href={`/admin/users/${user.id}`}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button 
            onClick={() => toggleSuspension(user.id, user.isSuspended)}
            className={`p-2 rounded-lg transition-colors ${
              user.isSuspended 
                ? "text-green-400 hover:bg-green-400/10" 
                : "text-amber-400 hover:bg-amber-400/10"
            }`}
            title={user.isSuspended ? "Unsuspend" : "Suspend"}
          >
            {user.isSuspended ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => deleteUser(user.id)}
            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">Total {users.length} users registered on the platform.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-colors font-medium">
          <Plus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-gray-900/50 border border-gray-800 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="ALL">All Roles</option>
          <option value="STUDENT">Students</option>
          <option value="BOTH">Tutors</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      <AdminDataTable 
        columns={columns} 
        data={users} 
        isLoading={isLoading} 
        emptyMessage="No users found matching your filters."
      />
    </div>
  );
}
