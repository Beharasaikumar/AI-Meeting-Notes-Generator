import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const suggestions = [
  "What were the key decisions from last week?",
  "Action items assigned to Sarah",
  "Q1 product strategy highlights",
  "Client onboarding status updates",
];

const SearchPage = () => {
  const [query, setQuery] = useState("");

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-semibold text-foreground">Search Meetings</h1>
        <p className="text-muted-foreground mt-1">Ask questions across all your meeting notes</p>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Ask anything about your meetings..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-20"
        />
        <Button size="sm" className="absolute right-1.5 top-1/2 -translate-y-1/2 gap-1" disabled={!query}>
          <Sparkles className="h-3.5 w-3.5" /> Search
        </Button>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {suggestions.map((s) => (
            <Card
              key={s}
              className="cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => setQuery(s)}
            >
              <CardContent className="p-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">{s}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {query && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary/50" />
            <p className="text-sm">AI-powered search coming soon.</p>
            <p className="text-xs mt-1">Connect your backend to enable semantic search across meetings.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchPage;
