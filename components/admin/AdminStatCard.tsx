import { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  description?: string;
  color?: string;
}

export default function AdminStatCard({
  label,
  value,
  icon: Icon,
  trend,
  description,
  color = "indigo",
}: AdminStatCardProps) {
  const colorVariants: Record<string, string> = {
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className={`p-6 rounded-2xl border ${colorVariants[color] || colorVariants.indigo} bg-gray-900/50 backdrop-blur-sm`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorVariants[color] || colorVariants.indigo} border`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`text-xs font-medium px-2 py-1 rounded-full ${trend.isUp ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {trend.isUp ? "+" : "-"}{trend.value}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-400 font-medium mb-1">{label}</p>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        {description && <p className="text-xs text-gray-500 mt-2">{description}</p>}
      </div>
    </div>
  );
}
