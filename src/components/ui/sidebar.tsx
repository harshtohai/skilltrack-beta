"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";
import { Sheet, SheetContent } from "~/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";

/**
 * Sidebar per design §3.1/§3.3/§4.6 (S1 app shell): fixed h-svh w-60 expanded /
 * w-16 collapsed, bg-sidebar, content scrolls but sidebar does not. Mobile:
 * off-canvas Sheet (side="left") via SidebarTrigger (§11).
 */

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [open, setOpen] = React.useState(true);
  const [openMobile, setOpenMobile] = React.useState(false);

  // Cookie persistence (design §15.7 — remember expanded/collapsed state)
  React.useEffect(() => {
    const saved = document.cookie
      .split("; ")
      .find((row) => row.startsWith("sidebar:state="))
      ?.split("=")[1];
    if (saved === "collapsed") setOpen(false);
    else if (saved === "expanded") setOpen(window.innerWidth >= 1024);
  }, []);

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const onChange = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) setOpen(false);
      else setOpen(true);
    };
    mq.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < 1024);
    if (window.innerWidth < 1024) setOpen(false);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((v) => !v);
      return;
    }
    setOpen((v) => {
      document.cookie = `sidebar:state=${!v ? "collapsed" : "expanded"}; path=/; max-age=${60 * 60 * 24 * 365}`;
      return !v;
    });
  }, [isMobile]);

  const contextValue = React.useMemo(
    () => ({
      state: open ? ("expanded" as const) : ("collapsed" as const),
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
    }),
    [open, openMobile, isMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={400}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  );
}

function Sidebar({ children }: { children: React.ReactNode }) {
  const { isMobile, open, openMobile, setOpenMobile } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="left"
          className="group/sidebar-root w-72 border-sidebar-border bg-sidebar p-0 data-[state=open]:text-sidebar-foreground [&>button]:hidden"
        >
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      data-slot="sidebar"
      data-state={open ? "expanded" : "collapsed"}
      className="group/sidebar-root fixed inset-y-0 left-0 z-20 hidden h-svh w-60 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:flex data-[state=collapsed]:w-16"
    >
      {children}
    </aside>
  );
}

function SidebarTrigger({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar, state } = useSidebar();
  return (
    <button
      data-slot="sidebar-trigger"
      data-state={state}
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 [&_svg]:size-4",
        className,
      )}
      {...props}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect width="18" height="18" rx="2" />
        <path d="M9 3v18" />
        {state === "collapsed" ? <path d="M14 9l3 3-3 3" /> : <path d="M17 9l-3 3 3 3" />}
      </svg>
    </button>
  );
}

function SidebarInset({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      data-slot="sidebar-inset"
      className={cn(
        "flex min-h-svh flex-1 flex-col bg-background transition-[padding] duration-200 lg:pl-60",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("flex h-10 flex-col justify-center p-3", className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("flex flex-col p-3", className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn("flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden", className)}
      {...props}
    />
  );
}

function SidebarSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-separator"
      className={cn("mx-3 my-3 h-px border-t border-sidebar-border", className)}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn("relative flex w-full flex-col", className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn("flex h-8 items-center px-3 text-caption font-medium text-muted-foreground group-data-[state=collapsed]/sidebar-root:hidden", className)}
      {...props}
    />
  );
}

function SidebarGroupContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sidebar-group-content" className={cn("w-full", className)} {...props} />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn("flex w-full min-w-0 flex-col gap-0.5", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  "flex h-9 w-full items-center gap-3 overflow-hidden rounded-lg px-3 text-left text-body-sm outline-none transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 group-data-[state=collapsed]/sidebar-root:mx-auto group-data-[state=collapsed]/sidebar-root:size-8 group-data-[state=collapsed]/sidebar-root:justify-center group-data-[state=collapsed]/sidebar-root:gap-0 group-data-[state=collapsed]/sidebar-root:px-0 group-data-[state=collapsed]/sidebar-root:[&>span]:hidden [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "text-sidebar-foreground",
        active: "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function SidebarMenuButton({
  asChild = false,
  variant = "default",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof sidebarMenuButtonVariants> & {
    asChild?: boolean;
    isActive?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  const { state, isMobile } = useSidebar();
  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-active={isActive ? "true" : undefined}
      className={cn(
        sidebarMenuButtonVariants({ variant: isActive ? "active" : variant, className }),
      )}
      {...props}
    />
  );
  if (state === "collapsed" && !isMobile && props["aria-label"]) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">{props["aria-label"]}</TooltipContent>
      </Tooltip>
    );
  }
  return button;
}

export {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
};
