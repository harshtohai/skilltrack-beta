"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import {
  ChevronsUpDown,
  ChevronDown,
  GraduationCap,
  LogOut,
  Search,
} from "lucide-react";

import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Collapsible, CollapsibleTrigger, CollapsibleContentIndented } from "~/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "~/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Kbd } from "~/components/ui/kbd";
import { CommandPalette } from "~/components/layouts/command-palette";
import { isNavActive, navForRole, ROLE_LABELS } from "~/lib/nav";
import type { UserRole } from "~/lib/protected-routes";

/**
 * App sidebar per design §3.3/§15.7: logo + collapse, role indicator, ⌘K
 * search trigger, role-aware nav groups, user card at footer opening an upward
 * menu (theme Light/Dark/System per DM-10, log out LAST after separator).
 */

export type SidebarUser = { name: string; role: UserRole } | null;

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

function AppSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const role: UserRole = user?.role ?? "trainee";
  const groups = navForRole[role];
  const { state, isMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const displayName = user?.name && user.name.trim() !== "" ? user.name : "Signed in";
  const initials = user?.name && user.name.trim() !== "" ? initialsOf(user.name) : "U";

  return (
    <>
      <CommandPalette role={role} />
      <Sidebar>
        {/* Header: logo left, collapse right (§3.3) */}
        <SidebarHeader>
          <div className="flex h-10 items-center justify-between px-1">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-1 py-1 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                <GraduationCap className="size-4" />
              </span>
              <span
                className={cn(
                  "text-title font-semibold",
                  collapsed && "hidden",
                )}
              >
                SkillsTrack
              </span>
            </Link>
            <SidebarTrigger />
          </div>
        </SidebarHeader>

        {/* Role indicator (workspace switcher slot, §3.3) — static: one role per user */}
        <div className="px-3 pt-1">
          <div
            className={cn(
              "flex h-10 items-center rounded-lg bg-sidebar-accent px-3",
              collapsed && "size-10 justify-center px-0",
            )}
          >
            <span className="truncate text-body-sm font-medium text-sidebar-accent-foreground">
              {collapsed ? <span className="sr-only">{ROLE_LABELS[role]}</span> : ROLE_LABELS[role]}
            </span>
            {!collapsed ? (
              <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground opacity-60" aria-hidden />
            ) : null}
          </div>
        </div>

        {/* ⌘K search trigger (§15.5) */}
        <div className="px-3 pt-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("skilltrack:command-open"))}
            aria-label="Open command palette"
            className={cn(
              "flex h-9 w-full items-center gap-2 rounded-lg bg-muted px-3 text-body-sm text-muted-foreground transition-colors duration-150 hover:border hover:border-input focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
              collapsed && "size-9 justify-center px-0",
            )}
          >
            <Search className="size-4 shrink-0" />
            {!collapsed ? (
              <>
                <span>Search</span>
                <Kbd className="ml-auto">⌘K</Kbd>
              </>
            ) : null}
          </button>
        </div>

        {/* Nav groups (role-aware, collapsible per shadcn docs / §15.7) */}
        <SidebarContent className="pt-3">
          {groups.map((group, gi) => (
            <Collapsible key={group.label ?? gi} defaultOpen className={group.label ? "group/collapsible" : undefined}>
              <SidebarGroup>
                {group.label ? (
                  <CollapsibleTrigger asChild>
                    <div
                      className="flex h-8 w-full cursor-pointer select-none items-center px-3 text-caption font-medium text-muted-foreground outline-none transition-colors duration-150 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 group-data-[state=collapsed]/sidebar-root:hidden [&_svg]:size-3.5"
                    >
                      {group.label}
                      <ChevronDown className="ml-auto shrink-0 transition-transform duration-200 group-data-expanded/collapsible:rotate-180" aria-hidden />
                    </div>
                  </CollapsibleTrigger>
                ) : null}
                <CollapsibleContentIndented>
                  <SidebarMenu className="pt-0.5">
                    {group.items.map((item) => {
                      const active = isNavActive(pathname, item.href);
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton asChild isActive={active} aria-label={item.label}>
                            <Link href={item.href} aria-current={active ? "page" : undefined}>
                              <item.icon />
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </CollapsibleContentIndented>
              </SidebarGroup>
            </Collapsible>
          ))}
          <SidebarSeparator />
        </SidebarContent>

        {/* Footer: user card → upward menu (§3.3/§15.5) */}
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Open user menu"
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border bg-card p-2 text-left transition-colors duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                  collapsed && "justify-center px-0",
                )}
              >
                <Avatar className="size-8">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                {!collapsed ? (
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-sm font-medium text-foreground">
                      {displayName}
                    </span>
                    <span className="block truncate text-caption text-muted-foreground">
                      {ROLE_LABELS[role]}
                    </span>
                  </span>
                ) : null}
                {!collapsed ? (
                  <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground" aria-hidden />
                ) : null}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="min-w-56">
              <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ThemeRadioItems />
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  void signOut({ callbackUrl: "/login" }).then(() => {
                    // Fallback: if the post-signout redirect doesn't fire (stale
                    // client state), force a hard navigation to login.
                    window.location.assign("/login");
                  });
                }}
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}

function ThemeRadioItems() {
  const { theme, setTheme } = useTheme();
  return (
    <DropdownMenuRadioGroup value={theme ?? "system"} onValueChange={setTheme}>
      <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  );
}

export { AppSidebar };
