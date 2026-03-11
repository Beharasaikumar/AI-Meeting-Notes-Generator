// src/pages/Upload.tsx
import { useState } from "react";
import { Upload as UploadIcon, FileAudio, X, Mic, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { meetingsApi } from "@/lib/api";

type UploadStep = "idle" | "creating" | "uploading" | "done" | "error";

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [participants, setParticipants] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState<UploadStep>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [meetingId, setMeetingId] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type.startsWith("audio/")) {
      setFile(dropped);
      if (!title) setTitle(dropped.name.replace(/\.[^.]+$/, ""));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!title) setTitle(selected.name.replace(/\.[^.]+$/, ""));
    }
  };

  const handleSubmit = async () => {
    if (!file || !title) return;
    setError(null);

    const participantList = participants
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    // 1. Create meeting record
    setStep("creating");
    let newMeetingId: string;
    try {
      const meeting = await meetingsApi.create({
        title,
        date: new Date().toISOString(),
        participants: participantList.length > 0 ? participantList : ["Unknown"],
        status: "scheduled",
      });
      newMeetingId = meeting.id;
      setMeetingId(meeting.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create meeting");
      setStep("error");
      return;
    }

    // 2. Upload audio
    setStep("uploading");
    try {
      await meetingsApi.uploadAudio(newMeetingId, file, (pct) => setProgress(pct));
      setStep("done");
      // Navigate to the meeting after a brief pause
      setTimeout(() => navigate(`/meeting/${newMeetingId}`), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setStep("error");
    }
  };

  const busy = step === "creating" || step === "uploading";

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-semibold text-foreground">New Meeting</h1>
        <p className="text-muted-foreground mt-1">Upload a recording to transcribe and analyse</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="cursor-pointer hover:border-primary/30 transition-colors opacity-60">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto rounded-xl bg-primary/10 p-4 w-fit mb-2">
              <Mic className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-base">Live Recording</CardTitle>
            <CardDescription>Record a meeting in real-time</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" size="sm" disabled>Coming Soon</Button>
          </CardContent>
        </Card>

        <Card className="border-primary/40 bg-primary/5">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto rounded-xl bg-primary/10 p-4 w-fit mb-2">
              <UploadIcon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-base">Upload Audio</CardTitle>
            <CardDescription>Upload a pre-recorded file</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              placeholder="e.g., Weekly Standup"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={busy}
            />
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <Label htmlFor="participants">Participants <span className="text-muted-foreground text-xs">(comma-separated)</span></Label>
            <Input
              id="participants"
              placeholder="e.g., Alice, Bob, Carol"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              disabled={busy}
            />
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileAudio className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                {!busy && (
                  <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div>
                <UploadIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag & drop an audio file, or{" "}
                  <label className="text-primary cursor-pointer hover:underline">
                    browse
                    <input type="file" accept="audio/*" className="hidden" onChange={handleFileSelect} />
                  </label>
                </p>
                <p className="text-xs text-muted-foreground">MP3, WAV, M4A, OGG up to 500 MB</p>
              </div>
            )}
          </div>

          {/* Progress */}
          {(step === "uploading" || step === "done") && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{step === "done" ? "Upload complete" : "Uploading…"}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
            </div>
          )}

          {/* Step status */}
          {step === "creating" && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Creating meeting record…
            </p>
          )}
          {step === "done" && (
            <p className="text-sm text-green-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Done! Redirecting to your meeting…
            </p>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" asChild disabled={busy}>
              <Link to="/">Cancel</Link>
            </Button>
            <Button onClick={handleSubmit} disabled={!file || !title || busy || step === "done"}>
              {busy ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing…</>
              ) : (
                <><UploadIcon className="h-4 w-4 mr-2" /> Upload & Process</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Upload;