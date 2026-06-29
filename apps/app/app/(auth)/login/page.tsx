"use client";

import Link from "next/link";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@corely/ui";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-lg rounded-[2rem] border-border/70 bg-background/90 shadow-sm">
        <CardHeader className="space-y-3">
          <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
            Migration in progress
          </Badge>
          <CardTitle>Authentication wiring is the next slice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            The Next app already owns the new UI runtime and the first in-app `todos` API. Auth and
            workspace context will be moved in the next pass.
          </p>
          <Button asChild>
            <Link href="/todos">Open todos</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
