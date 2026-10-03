"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export interface CohortOption {
  id: string;
  name: string;
  programmeName: string;
}

interface ApiError {
  error?: { message?: string };
}

/**
 * Trainee lifecycle actions (INST-03) per design §9.5/§4.8/CL-18: "Move to
 * cohort…" (ghost secondary action — Dialog with a Select of the trainee's
 * programme's cohorts) and the kebab's "Mark as dropped out" (destructive,
 * last in menu, confirmed with an AlertDialog naming the trainee and the
 * consequence). canMove/canDrop are computed server-side from the session
 * scope: admin always; institute only while the trainee has zero progress
 * data. Both hide once there is no active enrolment left.
 */
export function TraineeActions({
  publicId,
  traineeName,
  programmeName,
  canMove,
  canDrop,
  cohorts,
}: {
  publicId: string;
  traineeName: string;
  programmeName: string;
  canMove: boolean;
  canDrop: boolean;
  cohorts: CohortOption[];
}) {
  const router = useRouter();
  const [moveOpen, setMoveOpen] = useState(false);
  const [cohortId, setCohortId] = useState("");
  const [dropOpen, setDropOpen] = useState(false);
  const [busy, setBusy] = useState<"move" | "drop" | null>(null);
  const [error, setError] = useState("");

  const moveToCohort = async () => {
    setBusy("move");
    setError("");
    try {
      const res = await fetch(`/api/v1/trainees/${publicId}/move-cohort`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cohortId }),
      });
      if (!res.ok) {
        const json = (await res.json()) as ApiError;
        throw new Error(json.error?.message ?? "Couldn't move the trainee");
      }
      setMoveOpen(false);
      setCohortId("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't move the trainee");
    } finally {
      setBusy(null);
    }
  };

  const dropOut = async () => {
    setBusy("drop");
    setError("");
    try {
      const res = await fetch(`/api/v1/trainees/${publicId}/drop-out`, { method: "POST" });
      if (!res.ok) {
        const json = (await res.json()) as ApiError;
        throw new Error(json.error?.message ?? "Couldn't mark the trainee as dropped out");
      }
      setDropOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't mark the trainee as dropped out");
    } finally {
      setBusy(null);
    }
  };

  if (!canMove && !canDrop) return null;

  return (
    <div className="flex items-center gap-2">
      {canMove ? (
        <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              Move to cohort…
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Move {traineeName} to another cohort?</DialogTitle>
              <DialogDescription>
                Pick the new cohort below. The move is recorded in the audit log.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-1.5">
              <Label htmlFor="move-cohort">New cohort</Label>
              {cohorts.length > 0 ? (
                <Select value={cohortId} onValueChange={setCohortId}>
                  <SelectTrigger id="move-cohort">
                    <SelectValue placeholder="Select a cohort" />
                  </SelectTrigger>
                  <SelectContent>
                    {cohorts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.programmeName} · {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-caption text-muted-foreground">
                  No other cohorts available for this trainee&apos;s programme.
                </p>
              )}
              {error ? (
                <p role="alert" className="text-caption text-danger-text">
                  {error}
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMoveOpen(false)}>
                Cancel
              </Button>
              <Button disabled={!cohortId || busy === "move"} onClick={() => void moveToCohort()}>
                {busy === "move" ? "Moving…" : "Move trainee"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
      {canDrop ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="More actions">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => {
                  setError("");
                  setDropOpen(true);
                }}
              >
                Mark as dropped out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* CL-18: destructive confirm names the trainee + consequence; overlay
              click can't dismiss it (§4.8). */}
          <AlertDialog open={dropOpen} onOpenChange={setDropOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Move {traineeName} out of {programmeName}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Their seat is freed and this can&apos;t be undone from the institute side.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {error ? (
                <p role="alert" className="text-caption text-danger-text">
                  {error}
                </p>
              ) : null}
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={busy === "drop"}
                  onClick={(e) => {
                    e.preventDefault();
                    void dropOut();
                  }}
                >
                  {busy === "drop" ? "Marking…" : "Drop out"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : null}
    </div>
  );
}
