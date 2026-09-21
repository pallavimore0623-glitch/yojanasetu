import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Bell, LayoutDashboard, Menu, ShieldCheck, User2, FileText, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { fetchIsAdmin, fetchNotifications, fetchProfile } from "@/lib/api";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/schemes", label: "Schemes", icon: Search },
  { to: "/applications", label: "My Applications", icon: FileText },
  { to: "/notifications", label: "Alerts", icon: Bell },
  { to: "/profile", label: "Profile", icon: User2 },
];

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span
        className={cn(
          "grid size-9 place-items-center rounded-xl font-display text-lg font-bold",
          light ? "bg-primary-foreground/15 text-primary-foreground" : "gradient-hero text-primary-foreground",
        )}
      >
        य
      </span>
      <span className="leading-tight">
        <span
          className={cn(
            "block font-display text-lg font-bold",
            light ? "text-primary-foreground" : "text-foreground",
          )}
        >
          YojanaSetu
        </span>
        <span
          className={cn(
            "block text-[11px]",
            light ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          One Profile. All Eligible Schemes.
        </span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: Boolean(user),
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications", profile?.id],
    queryFn: () => fetchNotifications(profile!.id),
    enabled: Boolean(profile),
  });

  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: () => fetchIsAdmin(user!.id),
    enabled: Boolean(user),
  });

  const unread = (notifications ?? []).filter((n) => !n.is_read).length;

  const links = user ? [...NAV, ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: ShieldCheck }] : [])] : [];

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  pathname === l.to && "bg-primary-soft text-primary",
                )}
              >
                {l.label}
                {l.to === "/notifications" && unread > 0 && (
                  <span className="ml-1.5 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
                    {unread}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <Button variant="outline" size="sm" className="hidden lg:inline-flex" onClick={handleSignOut}>
                <LogOut className="size-4" /> Logout
              </Button>
            ) : (
              <Button asChild size="sm" className="hidden lg:inline-flex">
                <Link to="/auth">Login / Sign Up</Link>
              </Button>
            )}

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="px-4 pt-4">Menu</SheetTitle>
                <div className="mt-4 flex flex-col gap-1 px-2">
                  {links.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                    >
                      <l.icon className="size-4 text-primary" />
                      {l.label}
                      {l.to === "/notifications" && unread > 0 && (
                        <span className="ml-auto rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
                          {unread}
                        </span>
                      )}
                    </Link>
                  ))}
                  <div className="mt-3 px-1">
                    {user ? (
                      <Button variant="outline" className="w-full" onClick={handleSignOut}>
                        <LogOut className="size-4" /> Logout
                      </Button>
                    ) : (
                      <Button asChild className="w-full">
                        <Link to="/auth" onClick={() => setOpen(false)}>
                          Login / Sign Up
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          <p className="text-sm font-semibold text-foreground">YojanaSetu</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This prototype is for demonstration. Always verify scheme details on the official
            government portal before applying.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            YojanaSetu — Prototype for academic demonstration.
          </p>
        </div>
      </footer>
    </div>
  );
}
