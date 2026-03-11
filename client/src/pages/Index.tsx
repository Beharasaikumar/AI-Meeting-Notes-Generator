// src/pages/Index.tsx
import { useEffect, useState } from "react";
import { Mic, Clock, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { MeetingCard } from "@/components/MeetingCard";
import { meetingsApi, statsApi, type Meeting, type DashboardStats } from "@/lib/api";
import { motion } from "framer-motion";

const Index = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalMeetings: 0,
    totalHours: 0,
    actionItemsCompleted: 0,
    actionItemsPending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [meetingData, statsData] = await Promise.all([
        meetingsApi.getAll(),
        statsApi.get(),
      ]);
      setMeetings(meetingData.slice(0, 4));
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your meeting intelligence at a glance</p>
        </div>
        <button
          onClick={load}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
        </button>
      </motion.div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error} — is the backend running on{" "}
          <code className="font-mono text-xs">{import.meta.env.VITE_API_URL ?? "http://localhost:3001"}</code>?
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Meetings" value={loading ? "…" : stats.totalMeetings} icon={Mic} description="This month" index={0} />
        <StatCard title="Hours Recorded" value={loading ? "…" : stats.totalHours.toFixed(1)} icon={Clock} description="Total recorded" index={1} />
        <StatCard title="Actions Done" value={loading ? "…" : stats.actionItemsCompleted} icon={CheckCircle2} description="This week" index={2} />
        <StatCard title="Pending Items" value={loading ? "…" : stats.actionItemsPending} icon={AlertCircle} description="Needs attention" index={3} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Meetings</h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass rounded-xl p-5 animate-pulse h-24" />
            ))}
          </div>
        ) : meetings.length > 0 ? (
          <div className="space-y-3">
            {meetings.map((meeting, i) => (
              <MeetingCard key={meeting.id} meeting={meeting} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Mic className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No meetings yet. Upload your first recording.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;