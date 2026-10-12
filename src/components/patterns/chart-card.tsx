import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

/**
 * ChartCard — the §4.11 chart-card shape (titled Card wrapping one chart):
 * Card > CardHeader(title, description) > CardContent(children). Every
 * analytics chart card on the admin + institute pages uses this exact
 * structure; the wrapper just removes the five-import boilerplate.
 */
function ChartCard({
  title,
  description,
  className,
  children,
}: {
  title: React.ReactNode;
  description: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export { ChartCard };
