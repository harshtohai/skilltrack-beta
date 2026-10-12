"use client";

import { useMemo, useState } from "react";
import { Loader2, MessageSquare, RefreshCw, Search, Users } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { EmptyState } from "~/components/patterns/empty-state";
import { ErrorState } from "~/components/patterns/error-state";
import { Skeleton } from "~/components/patterns/skeleton";

/**
 * Trainee picker card (simulator left column): Direct Start by phone, search +
 * district filter over the trainee list, and the selected-trainee preview.
 * Search/filter state is local UI state; the trainee list and selection live
 * in the page (the session needs the phone for /bot/inbound).
 */

export interface Trainee {
  id: string;
  publicId: string;
  fullName: string;
  phoneE164: string;
  district: string;
}

export function TraineePickerCard({
  trainees,
  traineesLoading,
  traineesError,
  traineesUnauthorized,
  onRetryTrainees,
  selectedTraineeId,
  onTraineeChange,
  phoneInput,
  onPhoneInputChange,
  starting,
  onStart,
  messagesCount,
  onReset,
}: {
  trainees: Trainee[];
  traineesLoading: boolean;
  traineesError: string;
  traineesUnauthorized: boolean;
  onRetryTrainees: () => void;
  selectedTraineeId: string;
  onTraineeChange: (traineeId: string) => void;
  phoneInput: string;
  onPhoneInputChange: (value: string) => void;
  starting: boolean;
  onStart: (phoneOverride?: string) => void;
  messagesCount: number;
  onReset: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

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

  const trainee = trainees.find((t) => t.id === selectedTraineeId);

  return (
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
              onChange={(e) => onPhoneInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void onStart();
                }
              }}
              disabled={starting}
            />
            <Button onClick={() => void onStart()} disabled={starting || !phoneInput.trim()}>
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
            onRetry={onRetryTrainees}
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

            <Select value={selectedTraineeId} onValueChange={onTraineeChange}>
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
              <div className="space-y-2 rounded-xl bg-muted/50 p-4">
                <div className="space-y-1.5">
                  <p className="text-body-sm font-medium">{trainee.fullName}</p>
                  <p className="text-caption text-muted-foreground">ID: {trainee.publicId}</p>
                  <p className="font-mono text-caption text-muted-foreground tabular-nums">
                    Phone: {trainee.phoneE164.replace(/(\+91)(\d{5})(\d{5})/, "$1 XXXXX $3")}
                  </p>
                  <p className="text-caption text-muted-foreground">District: {trainee.district}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => void onStart(trainee.phoneE164)}
                  disabled={starting}
                  className="w-full gap-2"
                >
                  {starting ? <Loader2 className="animate-spin" /> : <MessageSquare className="size-4" />}
                  {starting ? "Starting…" : "Start conversation"}
                </Button>
              </div>
            )}
          </>
        )}

        <Button
          variant="outline"
          onClick={onReset}
          disabled={messagesCount === 0}
          className="w-full gap-2"
        >
          <RefreshCw />
          Reset Session
        </Button>
      </CardContent>
    </Card>
  );
}
