import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Users, Calendar, CheckCircle2, Circle, MessageSquare, ListChecks, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { mockMeetings } from "@/lib/mock-data";
import { motion } from "framer-motion";

const MeetingDetail = () => {
  const { id } = useParams();
  const meeting = mockMeetings.find((m) => m.id === id);

  if (!meeting) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Meeting not found</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const speakerColors: Record<string, string> = {};
  const colors = [
    "text-primary", "text-accent", "text-warning", "text-destructive",
  ];
  meeting.participants.forEach((p, i) => {
    speakerColors[p] = colors[i % colors.length];
  });

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{meeting.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(meeting.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {meeting.duration}</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {meeting.participants.length} participants</span>
            </div>
          </div>
          <div className="flex gap-2">
            {meeting.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary" className="gap-1.5"><Lightbulb className="h-3.5 w-3.5" /> Summary</TabsTrigger>
          <TabsTrigger value="transcript" className="gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Transcript</TabsTrigger>
          <TabsTrigger value="actions" className="gap-1.5"><ListChecks className="h-3.5 w-3.5" /> Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-base">Meeting Summary</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{meeting.summary || "No summary available yet."}</p>
              </CardContent>
            </Card>

            {meeting.decisions && meeting.decisions.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Key Decisions</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {meeting.decisions.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{d}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader><CardTitle className="text-base">Participants</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {meeting.participants.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {p.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="text-foreground">{p}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transcript">
          <Card>
            <CardContent className="pt-6">
              {meeting.transcript && meeting.transcript.length > 0 ? (
                <div className="space-y-4">
                  {meeting.transcript.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3"
                    >
                      <span className="text-xs text-muted-foreground font-mono w-14 shrink-0 pt-0.5">
                        {entry.timestamp}
                      </span>
                      <div>
                        <span className={`text-sm font-medium ${speakerColors[entry.speaker] || "text-foreground"}`}>
                          {entry.speaker}
                        </span>
                        <p className="text-sm text-muted-foreground mt-0.5">{entry.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {meeting.status === "processing" ? "Transcript is being processed..." : "No transcript available."}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardContent className="pt-6">
              {meeting.actionItems && meeting.actionItems.length > 0 ? (
                <div className="space-y-3">
                  {meeting.actionItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox checked={item.completed} className="mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${item.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {item.text}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{item.assignee}</span>
                          {item.dueDate && (
                            <>
                              <Circle className="h-1 w-1 fill-current" />
                              <span>Due {new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No action items.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MeetingDetail;
