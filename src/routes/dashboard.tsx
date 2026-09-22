import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BellRing, FileText, Loader2, RefreshCw, Sparkles, UserCog } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { SchemeCard } from "@/components/SchemeCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { fetchApplications, fetchNotifications, fetchProfile, fetchSchemes } from "@/lib/api";
import { checkEligibility, formatDate, isExpired, profileCompletion } from "@/lib/eligibility";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — YojanaSetu" },
      {
        name: "description",
        content: "See your eligible schemes, new alerts and application progress in one place.",
      },
      { property: "og:title", content: "Dashboard — YojanaSetu" },
      {
        property: "og:description",
        content: "Your personal scheme dashboard: eligibility, alerts and applications.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <RequireAuth>
        <Dashboard />
      </RequireAuth>
    </AppShell>
  ),
});

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof BellRing;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="shadow-card">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-3xl font-bold text-primary">{value}</p>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
          </div>
          <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
            <Icon className="size-5" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: Boolean(user),
  });
  const { data: schemes = [], isLoading: loadingSchemes } = useQuery({
    queryKey: ["schemes"],
    queryFn: fetchSchemes,
  });
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", profile?.id],
    queryFn: () => fetchNotifications(profile!.id),
    enabled: Boolean(profile),
  });
  const { data: applications = [] } = useQuery({
    queryKey: ["applications", profile?.id],
    queryFn: () => fetchApplications(profile!.id),
    enabled: Boolean(profile),
  });

  const results = useMemo(
    () => schemes.map((s) => ({ scheme: s, result: checkEligibility(profile ?? null, s) })),
    [schemes, profile],
  );
  const eligible = results.filter((r) => r.result.eligible && !isExpired(r.scheme));
  const newest = [...schemes].slice(0, 3);
  const unread = notifications.filter((n) => !n.is_read).length;
  const completion = profileCompletion(profile ?? null);

  if (loadingProfile || loadingSchemes) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="mt-2 text-muted-foreground">
            Here is what YojanaSetu found using your saved profile.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            await queryClient.invalidateQueries();
            toast.success("Eligibility checked again with your latest profile.");
          }}
        >
          <RefreshCw className="size-4" /> Check Eligibility Again
        </Button>
      </div>

      {!profile && (
        <Card className="mt-6 border-warning/50 bg-warning/10 shadow-card">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
            <div>
              <p className="font-semibold text-warning-foreground">Your profile is missing</p>
              <p className="text-sm text-warning-foreground/90">
                Complete your profile to improve matching and see eligible schemes.
              </p>
            </div>
            <Button asChild>
              <Link to="/profile">Create Profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {profile && completion < 100 && (
        <Card className="mt-6 shadow-card">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
            <div className="min-w-56 flex-1">
              <p className="text-sm font-medium">Complete your profile to improve matching</p>
              <Progress value={completion} className="mt-3" />
            </div>
            <Button asChild variant="outline">
              <Link to="/profile">
                <UserCog className="size-4" /> Update Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Sparkles} label="Eligible Schemes" value={eligible.length} hint="Based on your profile" />
        <StatCard icon={BellRing} label="New Notifications" value={unread} hint="Unread alerts" />
        <StatCard icon={FileText} label="Applications" value={applications.length} hint="Submitted so far" />
        <StatCard icon={UserCog} label="Profile Completion" value={`${completion}%`} />
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Eligible for You</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/schemes">View all schemes</Link>
          </Button>
        </div>
        {eligible.length === 0 ? (
          <Card className="mt-4 shadow-card">
            <CardContent className="py-10 text-center">
              <p className="font-medium">No new eligible schemes found.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Complete your profile to improve matching, or browse all schemes.
              </p>
              <Button asChild className="mt-4" variant="outline">
                <Link to="/schemes">Browse schemes</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {eligible.slice(0, 6).map(({ scheme, result }) => (
              <SchemeCard key={scheme.id} scheme={scheme} result={result} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Newly Added</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {newest.map((s) => {
              const r = checkEligibility(profile ?? null, s);
              return (
                <div key={s.id} className="rounded-lg border border-border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to="/schemes/$schemeId"
                      params={{ schemeId: s.id }}
                      className="font-medium hover:text-primary"
                    >
                      {s.scheme_name}
                    </Link>
                    {r.eligible ? (
                      <Badge className="bg-success text-success-foreground hover:bg-success">Eligible</Badge>
                    ) : (
                      <Badge variant="outline">Not matching</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{s.benefit}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Last date: {formatDate(s.application_deadline)}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Application Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {applications.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                You have not applied to any scheme yet.
              </p>
            ) : (
              applications.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium">{a.schemes?.scheme_name ?? "Scheme"}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.application_ref} · {formatDate(a.submitted_at)}
                    </p>
                  </div>
                  <Badge variant="secondary">{a.status}</Badge>
                </div>
              ))
            )}
            <Button asChild variant="outline" className="w-full">
              <Link to="/applications">View My Applications</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
