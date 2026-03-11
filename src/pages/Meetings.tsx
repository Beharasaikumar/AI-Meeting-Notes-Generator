import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MeetingCard } from "@/components/MeetingCard";
import { mockMeetings } from "@/lib/mock-data";
import { motion } from "framer-motion";

const Meetings = () => {
  const [search, setSearch] = useState("");

  const filtered = mockMeetings.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-semibold text-foreground">All Meetings</h1>
        <p className="text-muted-foreground mt-1">Browse and search your meeting history</p>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search meetings by title or tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((meeting, i) => (
            <MeetingCard key={meeting.id} meeting={meeting} index={i} />
          ))
        ) : (
          <p className="text-center text-muted-foreground py-12">No meetings found.</p>
        )}
      </div>
    </div>
  );
};

export default Meetings;
