"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { TraineePickerCard, type Trainee } from "./trainee-picker-card";
import { ConversationCard, type Message } from "./conversation-card";
import { VerificationDialog } from "./verification-dialog";

/**
 * WhatsApp simulator (§9.10 "S4 wide" standalone — public dev tool): centered
 * max-w-4xl page, trainee picker card + conversation card with WhatsApp-style
 * bubbles (user = primary right, bot = muted left, 12h bubble times per
 * CL-14). The native alert() on session DONE is now a Dialog with the
 * verification link + copy. Bot-session states (Active/Completed) render as
 * neutral badges — not domain statuses (§4.10/CL-12).
 *
 * Session state and the bot API calls (inbound/start — sensitive) stay here;
 * rendering is split into the colocated picker/conversation/dialog components.
 */

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
  // API error responses are { error: { code, message } } — never a bare string.
  error?: { code?: string; message?: string };
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

  const resetSession = () => {
    setMessages([]);
    setSessionActive(false);
    setInput("");
    setActivePhone("");
  };

  const handleStartSimulation = async (phoneOverride?: string) => {
    const phone = (phoneOverride ?? phoneInput).trim();
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
          content:
            typeof data.error === "string"
              ? data.error
              : data.error?.message ?? "Could not start simulation for this phone number.",
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
          <TraineePickerCard
            trainees={trainees}
            traineesLoading={traineesLoading}
            traineesError={traineesError}
            traineesUnauthorized={traineesUnauthorized}
            onRetryTrainees={() => void loadTrainees()}
            selectedTraineeId={selectedTraineeId}
            onTraineeChange={handleTraineeChange}
            phoneInput={phoneInput}
            onPhoneInputChange={setPhoneInput}
            starting={starting}
            onStart={handleStartSimulation}
            messagesCount={messages.length}
            onReset={resetSession}
          />

          <ConversationCard
            messages={messages}
            messagesEndRef={messagesEndRef}
            sessionActive={sessionActive}
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            loading={loading}
          />
        </div>
      </div>

      <VerificationDialog
        doneUrl={doneUrl}
        copied={copied}
        onCopy={() => void copyLink()}
        onClose={() => setDoneUrl(null)}
      />
    </div>
  );
}
