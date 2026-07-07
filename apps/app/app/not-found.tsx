import Link from "next/link";

export default function NotFound(): any {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs text-muted-foreground">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This route is not part of the SpecGate App Router workspace.
        </p>
        <Link
          href="/home"
          className="mt-5 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Go to home
        </Link>
      </div>
    </main>
  );
}
