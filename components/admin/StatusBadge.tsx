interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    // Booking Statuses
    PENDING: { label: "Pending", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    CONFIRMED: { label: "Confirmed", className: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
    COMPLETED: { label: "Completed", className: "bg-green-500/10 text-green-500 border-green-500/20" },
    CANCELLED: { label: "Cancelled", className: "bg-red-500/10 text-red-500 border-red-500/20" },
    
    // Connection Statuses
    ACCEPTED: { label: "Accepted", className: "bg-green-500/10 text-green-500 border-green-500/20" },
    REJECTED: { label: "Rejected", className: "bg-red-500/10 text-red-500 border-red-500/20" },
    
    // Ticket Statuses
    OPEN: { label: "Open", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    IN_PROGRESS: { label: "In Progress", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    RESOLVED: { label: "Resolved", className: "bg-green-500/10 text-green-500 border-green-500/20" },
    CLOSED: { label: "Closed", className: "bg-gray-500/10 text-gray-500 border-gray-500/20" },

    // Role Statuses
    STUDENT: { label: "Student", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    BOTH: { label: "Tutor", className: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
    ADMIN: { label: "Admin", className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },

    // General
    ACTIVE: { label: "Active", className: "bg-green-500/10 text-green-500 border-green-500/20" },
    SUSPENDED: { label: "Suspended", className: "bg-red-500/10 text-red-500 border-red-500/20" },
  };

  const config = statusConfig[status.toUpperCase()] || { label: status, className: "bg-gray-500/10 text-gray-500 border-gray-500/20" };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${config.className}`}>
      {config.label}
    </span>
  );
}
