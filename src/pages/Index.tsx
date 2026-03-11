import { Mic, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { MeetingCard } from "@/components/MeetingCard";
import { mockMeetings, stats } from "@/lib/mock-data";
import { motion } from "framer-motion";

const Index = () => {
  const recentMeetings = mockMeetings.slice(0, 4);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your meeting intelligence at a glance</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Meetings" value={stats.totalMeetings} icon={Mic} description="This month" index={0} />
        <StatCard title="Hours Recorded" value={stats.totalHours} icon={Clock} description="38.5 hrs saved" index={1} />
        <StatCard title="Actions Done" value={stats.actionItemsCompleted} icon={CheckCircle2} description="This week" index={2} />
        <StatCard title="Pending Items" value={stats.actionItemsPending} icon={AlertCircle} description="Needs attention" index={3} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Meetings</h2>
        <div className="space-y-3">
          {recentMeetings.map((meeting, i) => (
            <MeetingCard key={meeting.id} meeting={meeting} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
