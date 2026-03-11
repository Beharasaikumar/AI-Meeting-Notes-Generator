export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: string[];
  status: "completed" | "processing" | "scheduled";
  tags: string[];
  summary?: string;
  actionItems?: ActionItem[];
  decisions?: string[];
  transcript?: TranscriptEntry[];
}

export interface ActionItem {
  id: string;
  text: string;
  assignee: string;
  dueDate?: string;
  completed: boolean;
}

export interface TranscriptEntry {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
}

export const mockMeetings: Meeting[] = [
  {
    id: "1",
    title: "Q1 Product Strategy Review",
    date: "2026-03-10",
    duration: "58 min",
    participants: ["Sarah Chen", "Marcus Rivera", "Priya Patel", "James O'Brien"],
    status: "completed",
    tags: ["strategy", "product", "quarterly"],
    summary: "The team reviewed Q1 progress against OKRs. The mobile app launch exceeded targets with 45K downloads in the first two weeks. Discussion focused on prioritizing the AI-powered search feature for Q2, with concerns about timeline given the current engineering bandwidth. Marketing proposed a phased rollout approach that was well-received.",
    actionItems: [
      { id: "a1", text: "Draft Q2 roadmap with AI search feature timeline", assignee: "Sarah Chen", dueDate: "2026-03-17", completed: false },
      { id: "a2", text: "Prepare engineering capacity analysis", assignee: "Marcus Rivera", dueDate: "2026-03-14", completed: true },
      { id: "a3", text: "Create phased rollout plan for marketing", assignee: "Priya Patel", dueDate: "2026-03-20", completed: false },
      { id: "a4", text: "Schedule follow-up with design team", assignee: "James O'Brien", dueDate: "2026-03-12", completed: true },
    ],
    decisions: [
      "AI search feature will be the primary Q2 focus",
      "Phased rollout approach approved for new features",
      "Engineering will hire 2 additional senior developers",
      "Weekly sync meetings reduced to bi-weekly",
    ],
    transcript: [
      { id: "t1", speaker: "Sarah Chen", text: "Let's start with the Q1 review. I'm pleased to report that the mobile app launch has been a significant success.", timestamp: "00:00:12" },
      { id: "t2", speaker: "Sarah Chen", text: "We hit 45,000 downloads in just two weeks, which is 150% of our target.", timestamp: "00:00:28" },
      { id: "t3", speaker: "Marcus Rivera", text: "That's great news. The engineering team really pulled together on this one. I want to highlight the work the backend team did on optimization.", timestamp: "00:00:45" },
      { id: "t4", speaker: "Priya Patel", text: "From the marketing side, the launch campaign exceeded expectations. Our social media engagement was up 300% during launch week.", timestamp: "00:01:15" },
      { id: "t5", speaker: "James O'Brien", text: "The design feedback has been overwhelmingly positive. Users are particularly loving the dark mode implementation.", timestamp: "00:01:42" },
      { id: "t6", speaker: "Sarah Chen", text: "Now let's discuss Q2 priorities. The AI-powered search feature has been on our roadmap, and I think it's time to move it to the top.", timestamp: "00:02:10" },
      { id: "t7", speaker: "Marcus Rivera", text: "I have some concerns about the timeline. Our current engineering bandwidth is stretched. We might need additional resources.", timestamp: "00:02:35" },
      { id: "t8", speaker: "Priya Patel", text: "What if we do a phased rollout? We could launch a basic version first and iterate based on user feedback.", timestamp: "00:03:00" },
      { id: "t9", speaker: "Sarah Chen", text: "I like that approach. Marcus, would that be more feasible from an engineering perspective?", timestamp: "00:03:22" },
      { id: "t10", speaker: "Marcus Rivera", text: "Yes, a phased approach would work much better. We could have phase one ready by end of April.", timestamp: "00:03:40" },
    ],
  },
  {
    id: "2",
    title: "Engineering Sprint Retrospective",
    date: "2026-03-09",
    duration: "42 min",
    participants: ["Marcus Rivera", "Alex Kim", "Dana Torres"],
    status: "completed",
    tags: ["engineering", "sprint", "retro"],
    summary: "Sprint 24 retrospective covering velocity improvements and blockers. The team achieved 92% sprint completion rate, up from 78% last sprint. Key blocker was the CI/CD pipeline instability, which caused 6 hours of lost productivity. Team agreed to invest in pipeline improvements next sprint.",
    actionItems: [
      { id: "a5", text: "Fix CI/CD pipeline flaky tests", assignee: "Alex Kim", dueDate: "2026-03-13", completed: false },
      { id: "a6", text: "Update sprint estimation guidelines", assignee: "Dana Torres", dueDate: "2026-03-11", completed: true },
    ],
    decisions: [
      "Allocate 20% of next sprint to tech debt",
      "Adopt new code review process",
    ],
  },
  {
    id: "3",
    title: "Client Onboarding - Meridian Corp",
    date: "2026-03-08",
    duration: "35 min",
    participants: ["Priya Patel", "Tom Nguyen", "Client: Lisa Park"],
    status: "completed",
    tags: ["client", "onboarding", "sales"],
    summary: "Initial onboarding call with Meridian Corp. Discussed implementation timeline, data migration requirements, and training schedule. Client expressed interest in the enterprise analytics add-on.",
    actionItems: [
      { id: "a7", text: "Send implementation timeline document", assignee: "Tom Nguyen", dueDate: "2026-03-10", completed: true },
      { id: "a8", text: "Schedule data migration dry run", assignee: "Priya Patel", dueDate: "2026-03-15", completed: false },
    ],
    decisions: [
      "Go-live date set for April 1st",
      "Weekly check-in calls during onboarding",
    ],
  },
  {
    id: "4",
    title: "Design System Workshop",
    date: "2026-03-11",
    duration: "1h 15min",
    participants: ["James O'Brien", "Maya Johnson", "Sarah Chen"],
    status: "processing",
    tags: ["design", "workshop"],
  },
  {
    id: "5",
    title: "Board Update Preparation",
    date: "2026-03-14",
    duration: "45 min",
    participants: ["Sarah Chen", "CFO: Robert Lane"],
    status: "scheduled",
    tags: ["board", "finance"],
  },
];

export const stats = {
  totalMeetings: 47,
  totalHours: 38.5,
  actionItemsCompleted: 23,
  actionItemsPending: 12,
};
