"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "~/components/ui/button";

/**
 * Shared logout — clears the session and returns to the login page so a
 * different role (admin, institute, employer, trainee) can sign in.
 */
export function LogoutButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 shrink-0"
      onClick={() => void signOut({ callbackUrl: "/login" })}
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}
