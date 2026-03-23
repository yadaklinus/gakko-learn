"use client";

import { useState, useEffect } from "react";
import { Search, Ticket, User, Clock, AlertCircle, CheckCircle, MoreVertical, MessageSquare } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

export default function TicketsManagementPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState("OPEN");

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/tickets?status=${filter}`);
      const data = await res.json();
      setTickets(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTicket = async (id: string, data: any) => {
    try {
      await fetch(`/api/admin/tickets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      fetchTickets();
      if (selectedTicket?.id === id) setSelectedTicket(null);
    } catch (error) {
      console.error(error);
    }
  };

  const priorityColors: Record<string, string> = {
    LOW: "text-gray-400",
    MEDIUM: "text-blue-400",
    HIGH: "text-amber-500",
    URGENT: "text-red-500",
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Support Tickets</h1>
          <p className="text-gray-400">Manage user inquiries and reported issues.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-800 pb-px">
        {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-3 text-sm font-medium transition-all relative ${
              filter === status ? "text-indigo-400" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {status.replace('_', ' ')}
            {filter === status && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-900/50 rounded-2xl border border-gray-800" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <div 
              key={ticket.id}
              onClick={() => {
                setSelectedTicket(ticket);
                setNote(ticket.adminNote || "");
              }}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 cursor-pointer hover:border-indigo-500/50 transition-all backdrop-blur-sm group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${priorityColors[ticket.priority]}`}>
                  <AlertCircle className="w-3 h-3" />
                  {ticket.priority}
                </div>
                <StatusBadge status={ticket.status} />
              </div>
              <h3 className="font-bold text-white mb-2 line-clamp-1">{ticket.title}</h3>
              <p className="text-gray-400 text-xs line-clamp-2 mb-4 leading-relaxed">{ticket.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-[10px] font-bold">
                    {ticket.user.name.charAt(0)}
                  </div>
                  <span className="text-xs text-gray-500">{ticket.user.name}</span>
                </div>
                <span className="text-[10px] text-gray-600 font-medium">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500 bg-gray-900/20 rounded-3xl border border-dashed border-gray-800">
              No tickets found in this category.
            </div>
          )}
        </div>
      )}

      {/* Ticket Detail Modal Alternative (Simple Overlay) */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest mb-2 ${priorityColors[selectedTicket.priority]}`}>
                    <AlertCircle className="w-3 h-3" />
                    {selectedTicket.priority} Priority
                  </div>
                  <h2 className="text-2xl font-bold text-white">{selectedTicket.title}</h2>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="p-2 text-gray-500 hover:text-white bg-gray-800 rounded-xl transition-colors text-sm">Close</button>
              </div>

              <div className="bg-gray-800/30 p-4 rounded-2xl border border-gray-700/50">
                <p className="text-sm text-gray-300 leading-relaxed">{selectedTicket.description}</p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Admin Note</label>
                <textarea 
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[120px]"
                  placeholder="Add a note or resolution details..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <select 
                  className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                  value={selectedTicket.status}
                  onChange={(e) => updateTicket(selectedTicket.id, { status: e.target.value, adminNote: note })}
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
                <button 
                  onClick={() => updateTicket(selectedTicket.id, { adminNote: note })}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
