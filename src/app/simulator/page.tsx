"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Send, Loader2, MessageSquare, RefreshCw, Users, Search, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { EmptyState } from "~/components/patterns/empty-state";
import { ErrorState } from "~/components/patterns/error-state";
import { Skeleton } from "~/components/patterns/skeleton";
import { time } from "~/lib/format";

/**
 * WhatsApp simulator (§9.10 "S4 wide" standalone — public dev tool): centered
 * max-w-4xl page, trainee picker card + conversation card with WhatsApp-style
 * bubbles (user = primary right, bot = muted left, 12h bubble times per
 * CL-14). The native alert() on session DONE is now a Dialog with the
 * verification link + copy. Bot-session states (Active/Completed) render as
 * neutral badges — not domain statuses (§4.10/CL-12).
 */

interface Trainee {
  id: string;
  publicId: string;
  fullName: string;
  phoneE164: string;
  district: string;
}

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  options?: Array<{ label: string; value: string }>;
  timestamp: Date;
}

interface TraineesResponse {
  data?: Trainee[];
}

interface BotReply {
  text: string;
  options?: Array<{ label: string; value: string }>;
  verificationUrl?: string;
}

interface InboundResponse {
  matched?: boolean;
  reply?: BotReply;
  sessionState?: string;
}

interface StartResponse {
  reply?: BotReply;
  error?: string;
}

export default function SimulatorPage() {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [traineesLoading, setTraineesLoading] = useState(true);
  const [traineesError, setTraineesError] = useState("");
  const [traineesUnauthorized, setTraineesUnauthorized] = useState(false);
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>("");
  const [phoneInput, setPhoneInput] = useState("");
  const [starting, setStarting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [activePhone, setActivePhone] = useState("");
  const [doneUrl, setDoneUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadTrainees = useCallback(async () => {
    setTraineesLoading(true);
    setTraineesError("");
    try {
      const res = await fetch("/api/v1/trainees?limit=500");
      if (res.status === 401 || res.status === 403) {
        setTraineesUnauthorized(true);
        setTrainees([]);
        return;
      }
      if (!res.ok) throw new Error("Failed to load trainees");
      setTraineesUnauthorized(false);
      const json = (await res.json()) as TraineesResponse;
      setTrainees(json.data ?? []);
      if (json.data?.[0]) setSelectedTraineeId(json.data[0].id);
    } catch (err) {
      console.error("Trainee load error:", err);
      setTraineesError("Failed to load trainees");
    } finally {
      setTraineesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTrainees();
  }, [loadTrainees]);

  const districts = useMemo(() => {
    const unique = new Set(trainees.map((t) => t.district));
    return Array.from(unique).sort();
  }, [trainees]);

  const filteredTrainees = useMemo(() => {
    return trainees.filter((t) => {
      const matchesSearch =
        t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.publicId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.phoneE164.includes(searchQuery) ||
        t.district.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDistrict =
        !selectedDistrict || selectedDistrict === "all" || t.district === selectedDistrict;
      return matchesSearch && matchesDistrict;
    });
  }, [trainees, searchQuery, selectedDistrict]);

  const handleTraineeChange = (traineeId: string) => {
    setSelectedTraineeId(traineeId);
    setMessages([]);
    setSessionActive(false);
    setInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (overrideText?: string) => {
    const text = overrideText ?? input;
    const phone = activePhone || trainees.find((t) => t.id === selectedTraineeId)?.phoneE164;
    if (!text.trim() || !phone || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = text;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/bot/inbound", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.NEXT_PUBLIC_INTERNAL_API_KEY ?? "",
        },
        body: JSON.stringify({
          provider: "simulator",
          provider_message_id: `sim_${Date.now()}`,
          from_phone_e164: phone,
          text: currentInput,
          received_at: new Date().toISOString(),
          channel: "whatsapp",
        }),
      });

      const data = (await res.json()) as InboundResponse;

      if (data.matched && data.reply) {
        const botMessage: Message = {
          id: crypto.randomUUID(),
          role: "bot",
          content: data.reply.text,
          options: data.reply.options,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);

        if (data.sessionState === "DONE") {
          setSessionActive(false);
          if (data.reply.verificationUrl) {
            setTimeout(() => setDoneUrl(data.reply?.verificationUrl ?? null), 100);
          }
        } else {
          setSessionActive(true);
        }
      } else if (!data.matched) {
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "bot",
          content: "No active follow-up found for this trainee. Please trigger a follow-up first.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (err) {
      console.error("Simulator error:", err);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "bot",
        content: "Error processing message. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const resetSession = () => {
    setMessages([]);
    setSessionActive(false);
    setInput("");
    setActivePhone("");
  };

  const handleStartSimulation = async () => {
    const phone = phoneInput.trim();
    if (!phone || starting) return;

    setStarting(true);
    setMessages([]);

    try {
      const res = await fetch("/api/v1/bot/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.NEXT_PUBLIC_INTERNAL_API_KEY ?? "",
        },
        body: JSON.stringify({ phone_e164: phone }),
      });

      const data = (await res.json()) as StartResponse;

      if (!res.ok) {
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "bot",
          content: data.error ?? "Could not start simulation for this phone number.",
          timestamp: new Date(),
        };
        setMessages([errorMessage]);
        setSessionActive(false);
        return;
      }

      // Sync the trainee select with the direct-started phone
      const match = trainees.find((t) => t.phoneE164 === phone);
      if (match) setSelectedTraineeId(match.id);
      setActivePhone(phone);

      if (data.reply) {
        const botMessage: Message = {
          id: crypto.randomUUID(),
          role: "bot",
          content: data.reply.text,
          options: data.reply.options,
          timestamp: new Date(),
        };
        setMessages([botMessage]);
        setSessionActive(true);
      }
    } catch (err) {
      console.error("Start simulation error:", err);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "bot",
        content: "Error starting simulation. Please try again.",
        timestamp: new Date(),
      };
      setMessages([errorMessage]);
    } finally {
      setStarting(false);
    }
  };

  const copyLink = async () => {
    if (!doneUrl) return;
    try {
      await navigator.clipboard.writeText(doneUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const trainee = trainees.find((t) => t.id === selectedTraineeId);
  const lastMsg = messages[messages.length - 1];

  return (
    <div className="min-h-svh bg-background p-4 md:p-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header (§3.4) */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-h1 font-medium tracking-tight">WhatsApp Simulator</h1>
            <p className="mt-1 text-body-sm text-muted-foreground">
              Test the conversation flow without a real WhatsApp account
            </p>
          </div>
          <Badge variant="secondary" className="gap-1.5 self-start">
            <MessageSquare className="size-3" />
            Dev Mode
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Trainee picker card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5" />
                Select Trainee
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Direct start by phone */}
              <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <Label htmlFor="phone-start" className="text-body-sm font-medium">
                  Direct Start (by phone)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="phone-start"
                    type="tel"
                    placeholder="+919876543210"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void handleStartSimulation();
                      }
                    }}
                    disabled={starting}
                  />
                  <Button onClick={() => void handleStartSimulation()} disabled={starting || !phoneInput.trim()}>
                    {starting ? <Loader2 className="animate-spin" /> : "Start"}
                  </Button>
                </div>
                <p className="text-caption text-muted-foreground">
                  Runs the WhatsApp flow immediately — auto-creates a follow-up if none is active.
                </p>
              </div>

              {/* Search and filter */}
              {traineesUnauthorized ? (
                <EmptyState
                  icon={<Users />}
                  title="Sign in to browse trainees"
                  description="The trainee picker needs an admin or institute session. Direct Start by phone still works."
                  className="py-8"
                />
              ) : traineesLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              ) : traineesError ? (
                <ErrorState
                  title="Couldn't load trainees"
                  description={traineesError}
                  onRetry={() => void loadTrainees()}
                  className="py-8"
                />
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search by name, ID, phone, district…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter by district" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Districts</SelectItem>
                      {districts.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedTraineeId} onValueChange={handleTraineeChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a trainee…" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTrainees.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.fullName} ({t.district})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {trainee && (
                    <div className="space-y-1.5 rounded-xl bg-muted/50 p-4">
                      <p className="text-body-sm font-medium">{trainee.fullName}</p>
                      <p className="text-caption text-muted-foreground">ID: {trainee.publicId}</p>
                      <p className="font-mono text-caption text-muted-foreground tabular-nums">
                        Phone: {trainee.phoneE164.replace(/(\+91)(\d{5})(\d{5})/, "$1 XXXXX $3")}
                      </p>
                      <p className="text-caption text-muted-foreground">District: {trainee.district}</p>
                    </div>
                  )}
                </>
              )}

              <Button
                variant="outline"
                onClick={resetSession}
                disabled={messages.length === 0}
                className="w-full gap-2"
              >
                <RefreshCw />
                Reset Session
              </Button>
            </CardContent>
          </Card>

          {/* Conversation card */}
          <Card className="flex flex-col lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2">
                <MessageSquare className="size-5" />
                Conversation
                {sessionActive && <Badge variant="secondary" className="gap-1.5"><span className="size-1.5 rounded-full bg-primary" aria-hidden />Active</Badge>}
                {!sessionActive && messages.length > 0 && (
                  <Badge variant="secondary">Completed</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col">
              <ScrollArea className="h-list-sm lg:h-list">
                <div className="space-y-4 pb-4" ref={messagesEndRef}>
                  {messages.length === 0 ? (
                    <EmptyState
                      icon={<MessageSquare />}
                      title="Select a trainee and start the conversation"
                      description="Type a response or tap an option button. The bot asks the 30/90-day follow-up questions."
                    />
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            msg.role === "user"
                              ? "rounded-br-none bg-primary text-primary-foreground"
                              : "rounded-bl-none bg-muted"
                          }`}
                        >
                          <p className="text-body-sm">{msg.content}</p>
                          <p className={`mt-1 text-caption tabular-nums ${msg.role === "user" ? "opacity-70" : "text-muted-foreground"}`}>
                            {time(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              <div className="mt-4 border-t pt-4">
                {lastMsg?.options?.length ? (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {lastMsg.options.map((opt) => (
                      <Button
                        key={opt.value}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInput(opt.value);
                          void handleSend(opt.value);
                        }}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                ) : null}

                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your response…"
                    disabled={loading || !sessionActive || messages.length === 0}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => void handleSend()}
                    disabled={loading || !input.trim()}
                    size="lg"
                    aria-label="Send message"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <Send />}
                  </Button>
                </div>

                {!sessionActive && messages.length === 0 && (
                  <p className="mt-2 text-center text-body-sm text-muted-foreground">
                    Select a trainee to begin. The bot will send the first question automatically.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* DONE → verification link Dialog (replaces native alert) */}
      <Dialog open={doneUrl !== null} onOpenChange={(open) => !open && setDoneUrl(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session complete</DialogTitle>
            <DialogDescription>
              The follow-up conversation finished and a verification link was generated for the
              trainee’s employment claim. Share it so the employer can confirm the outcome.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
            <code className="min-w-0 flex-1 break-all text-body-sm">{doneUrl}</code>
            <Button variant="outline" size="sm" onClick={() => void copyLink()} className="shrink-0 gap-2">
              {copied ? <Check className="text-success-text" /> : <Copy />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setDoneUrl(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
