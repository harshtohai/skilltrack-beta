"use client";

import { useRef } from "react";

/**
 * 6-slot OTP input per §4.2: size-11 rounded-lg slots, group gap-2, active
 * slot ring-3 ring-ring/40 border-ring; paste fills all; auto-submit on
 * complete; errors via aria-invalid + message (no shake).
 */
export function OtpSlots({
  value,
  onValueChange,
  invalid,
  disabled,
}: {
  value: string;
  onValueChange: (value: string) => void;
  invalid: boolean;
  disabled: boolean;
}) {
  const slotsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.split("");

  function focusSlot(index: number) {
    slotsRef.current[Math.max(0, Math.min(5, index))]?.focus();
  }

  function setDigit(index: number, digit: string) {
    const next = [...digits];
    next[index] = digit;
    onValueChange(next.join(""));
  }

  return (
    <div className="flex gap-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            slotsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1}`}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          value={digits[index] ?? ""}
          className="size-11 rounded-lg border border-input bg-card text-center text-title font-semibold tabular-nums text-foreground placeholder:text-muted-foreground transition-colors duration-150 hover:border-ring/50 focus:outline-none focus:border-ring focus:ring-3 focus:ring-ring/40 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50"
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "").slice(-1);
            setDigit(index, raw);
            if (raw) focusSlot(index + 1);
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData
              .getData("text")
              .replace(/\D/g, "")
              .slice(0, 6);
            if (!pasted) return;
            e.preventDefault();
            onValueChange(pasted);
            focusSlot(pasted.length);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
              setDigit(index - 1, "");
              focusSlot(index - 1);
              e.preventDefault();
            }
          }}
        />
      ))}
    </div>
  );
}
