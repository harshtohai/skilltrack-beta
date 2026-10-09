"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { LogOut, Moon, Sun, SunMoon } from "lucide-react";

import { useSidebar } from "~/components/ui/sidebar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "~/components/ui/command";
import { navForRole, type NavItem } from "~/lib/nav";
import type { UserRole } from "~/lib/protected-routes";

/**
 * Command palette per design §4.7/§15.5: ⌘K/Ctrl+K global keybinding, Esc
 * closes. Groups: Navigate (role-allowed routes) + Actions (theme, sign out).
 * Self-contained: renders inside the AppSidebar; the keybinding works anywhere.
 */
function CommandPalette({ role }: { role: UserRole }) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const groups = navForRole[role];

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const openEvent = () => setOpen(true);
    window.addEventListener("keydown", down);
    window.addEventListener("skilltrack:command-open", openEvent);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("skilltrack:command-open", openEvent);
    };
  }, []);

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  const go = (item: NavItem) => () => run(() => router.push(item.href));

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      className="max-w-lg"
    >
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {groups.map((group, gi) => (
          <React.Fragment key={group.label ?? gi}>
            <CommandGroup heading={group.label ?? "Navigate"}>
              {group.items.map((item) => (
                <CommandItem key={item.href} onSelect={go(item)}>
                  <item.icon />
                  {item.label}
                  <CommandShortcut>Go</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
            {gi < groups.length - 1 ? <CommandSeparator /> : null}
          </React.Fragment>
        ))}
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => run(() => setTheme("light"))}>
            <Sun />
            Light theme
          </CommandItem>
          <CommandItem onSelect={() => run(() => setTheme("dark"))}>
            <Moon />
            Dark theme
          </CommandItem>
          <CommandItem onSelect={() => run(() => setTheme("system"))}>
            <SunMoon />
            System theme
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                void signOut({ callbackUrl: "/login" }).then(() => {
                  // Fallback: if the post-signout redirect doesn't fire (stale
                  // client state), force a hard navigation to login.
                  window.location.assign("/login");
                });
              })
            }
          >
            <LogOut />
            Log out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export { CommandPalette };
