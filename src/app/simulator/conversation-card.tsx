"use client";

import { Loader2, MessageSquare, Send } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Badge } from "~/components/ui/badge";
import { EmptyState } from "~/components/patterns/empty-state";
import { time } from "~/lib/format";

/**
 * Conversation card (simulator session panel): WhatsApp-style bubbles
 * (user = primary right, bot = muted left, 12h bubble times per CL-14) plus
 * the option-button row and composer. Bot-session states (Active/Completed)
 * render as neutral badges — not domain statuses (§4.10/CL-12). Bubble markup
 * is byte-identical to the original inline rendering (sensitive: bot-message
 * rendering).
 */

export interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  options?: Array<{ label: string; value: string }>;
  timestamp: Date;
}

function MessageBubble({ msg }: { msg: Message }) {
  return (
    <div
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
  );
}

export function ConversationCard({
  messages,
  messagesEndRef,
  sessionActive,
  input,
  onInputChange,
  onSend,
  loading,
}: {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  sessionActive: boolean;
  input: string;
  onInputChange: (value: string) => void;
  onSend: (overrideText?: string) => void;
  loading: boolean;
}) {
  const lastMsg = messages[messages.length - 1];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void onSend();
    }
  };

  return (
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
              messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
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
                    onInputChange(opt.value);
                    void onSend(opt.value);
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
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response…"
              disabled={loading || !sessionActive || messages.length === 0}
              className="flex-1"
            />
            <Button
              onClick={() => void onSend()}
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
  );
}
