"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2, MessageSquare, RefreshCw, Users } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Badge } from "~/components/ui/badge";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

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

export default function SimulatorPage() {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/v1/trainees?limit=100")
      .then((res) => res.json())
      .then((data) => {
        setTrainees(data.data || []);
        if (data.data?.[0]) setSelectedTraineeId(data.data[0].id);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedTraineeId || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const trainee = trainees.find((t) => t.id === selectedTraineeId);
      if (!trainee) throw new Error("Trainee not found");

      const res = await fetch("/api/v1/bot/inbound", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.NEXT_PUBLIC_INTERNAL_API_KEY || "",
        },
        body: JSON.stringify({
          provider: "simulator",
          provider_message_id: `sim_${Date.now()}`,
          from_phone_e164: trainee.phoneE164,
          text: currentInput,
          received_at: new Date().toISOString(),
          channel: "whatsapp",
        }),
      });

      const data = await res.json();

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
          setTimeout(() => {
            if (data.reply.verificationUrl) {
              alert(`Verification link generated: ${data.reply.verificationUrl}`);
            }
          }, 100);
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
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTraineeChange = (traineeId: string) => {
    setSelectedTraineeId(traineeId);
    setMessages([]);
    setSessionActive(false);
  };

  const resetSession = async () => {
    setMessages([]);
    setSessionActive(false);
    setInput("");
  };

  const trainee = trainees.find((t) => t.id === selectedTraineeId);

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Simulator</h1>
          <p className="text-muted-foreground">Test the conversation flow without a real WhatsApp account</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <MessageSquare className="h-3 w-3" />
          Dev Mode
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Trainee
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedTraineeId} onValueChange={handleTraineeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a trainee..." />
              </SelectTrigger>
              <SelectContent>
                {trainees.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.fullName} ({t.district})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {trainee && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <p className="font-medium">{trainee.fullName}</p>
                <p className="text-sm text-muted-foreground">ID: {trainee.publicId}</p>
                <p className="text-sm text-muted-foreground">Phone: {trainee.phoneE164.replace(/(\+91)(\d{5})(\d{5})/, "$1 XXXXX $3")}</p>
                <p className="text-sm text-muted-foreground">District: {trainee.district}</p>
              </div>
            )}

            <Button variant="outline" onClick={resetSession} disabled={messages.length === 0} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Session
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversation
              {sessionActive && (
                <Badge variant="success" className="ml-2">Active</Badge>
              )}
              {!sessionActive && messages.length > 0 && (
                <Badge variant="secondary" className="ml-2">Completed</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1" ref={scrollAreaRef}>
              <div className="space-y-4 pb-4" ref={messagesEndRef}>
                {messages.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a trainee and start the conversation</p>
                    <p className="text-sm mt-2">Type a response or click an option button</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-50 mt-1">
                        {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t pt-4 mt-4">
              {(function () {
                const lastMsg = messages[messages.length - 1];
                if (!lastMsg?.options?.length) return null;
                return (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {lastMsg.options.map((opt) => (
                      <Button
                        key={opt.value}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInput(opt.value);
                          handleSend();
                        }}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                );
              })()}

              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your response..."
                  disabled={loading || !sessionActive || messages.length === 0}
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={loading || !input.trim()} size="lg">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>

              {!sessionActive && messages.length === 0 && (
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Select a trainee to begin. The bot will send the first question automatically.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}