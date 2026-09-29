"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "~/lib/utils";

/**
 * Tabs per design §4.6: pill style (list `h-9 rounded-lg bg-muted p-1`, trigger
 * `h-7 rounded-md px-3 text-body-sm data-[state=active]:bg-card shadow-sm`) is
 * the default — used inside cards. Line style for page-level sections comes via
 * the `variant` prop on TabsList/TabsTrigger.
 */
const Tabs = TabsPrimitive.Root;

function TabsList({
  className,
  variant = "pill",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: "pill" | "line";
}) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        variant === "pill" &&
          "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        variant === "line" &&
          "flex h-10 items-center gap-1 border-b text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  variant = "pill",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  variant?: "pill" | "line";
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      data-variant={variant}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap px-3 text-body-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        variant === "pill" &&
          "h-7 rounded-md data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:text-foreground",
        variant === "line" &&
          "h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("mt-4 focus-visible:outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
