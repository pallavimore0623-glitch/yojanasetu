import { Link } from "@tanstack/react-router";
import { Loader2, LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center px-4 text-center">
        <div>
          <LockKeyhole className="mx-auto size-10 text-primary" />
          <h1 className="mt-4 text-xl font-semibold">Please sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You need an account to view your schemes, alerts and applications.
          </p>
          <Button asChild className="mt-5">
            <Link to="/auth">Login / Sign Up</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
