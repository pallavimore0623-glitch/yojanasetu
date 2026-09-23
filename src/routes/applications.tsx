import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { fetchApplications, fetchProfile } from "@/lib/api";
import { formatDate } from "@/lib/eligibility";

export const Route = createFileRoute("/applications")({
  head: () => ({
    meta: [
      { title: "My Applications — YojanaSetu" },
      {
        name: "description",
        content: "Track the status of every scheme application you submitted through YojanaSetu.",
      },
      { property: "og:title", content: "My Applications — YojanaSetu" },
      {
        property: "og:description",
        content: "See application IDs, submission dates and current status for your schemes.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <RequireAuth>
        <ApplicationsPage />
      </RequireAuth>
    </AppShell>
  ),
});

function statusTone(status: string) {
  if (status === "Approved") return "bg-success-soft text-success";
  if (status === "Rejected") return "bg-destructive/10 text-destructive";
  if (status === "Under Review") return "bg-primary-soft text-primary";
  return "bg-secondary text-muted-foreground";
}

function ApplicationsPage() {
  const { user } = useAuth();
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: Boolean(user),
  });
  const { data: applications, isLoading } = useQuery({
    queryKey: ["applications", profile?.id],
    queryFn: () => fetchApplications(profile!.id),
    enabled: Boolean(profile),
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">My Applications</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sample tracking for this prototype. No application is sent to any government office.
      </p>

      {isLoading && (
        <div className="grid min-h-[30vh] place-items-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && (applications ?? []).length === 0 && (
        <Card className="mt-6">
          <CardContent className="grid place-items-center gap-3 py-12 text-center">
            <FileText className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              You have not applied to any scheme yet.
            </p>
            <Button asChild>
              <Link to="/schemes">Browse schemes</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 space-y-4">
        {(applications ?? []).map((a) => (
          <Card key={a.id}>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-lg">
                  {a.schemes?.scheme_name ?? "Scheme"}
                </CardTitle>
                <Badge className={statusTone(a.status)} variant="secondary">
                  {a.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
              <div>
                <p>
                  Application ID: <span className="font-mono text-foreground">{a.application_ref}</span>
                </p>
                <p>Submitted on {formatDate(a.submitted_at)}</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/schemes/$schemeId" params={{ schemeId: a.scheme_id }}>
                  View scheme
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
