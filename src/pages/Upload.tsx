import { useState } from "react";
import { Upload as UploadIcon, FileAudio, X, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith("audio/")) {
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

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-semibold text-foreground">New Meeting</h1>
        <p className="text-muted-foreground mt-1">Upload a recording or start a live session</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="cursor-pointer hover:border-primary/30 transition-colors">
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

        <Card className="cursor-pointer hover:border-primary/30 transition-colors">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto rounded-xl bg-accent/10 p-4 w-fit mb-2">
              <UploadIcon className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-base">Upload Audio</CardTitle>
            <CardDescription>Upload a pre-recorded file</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title</Label>
            <Input id="title" placeholder="e.g., Weekly Standup" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

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
                <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                  <X className="h-4 w-4" />
                </Button>
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
                <p className="text-xs text-muted-foreground">MP3, WAV, M4A up to 500MB</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" asChild>
              <Link to="/">Cancel</Link>
            </Button>
            <Button disabled={!file || !title}>
              <UploadIcon className="h-4 w-4 mr-2" /> Process Meeting
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Upload;
