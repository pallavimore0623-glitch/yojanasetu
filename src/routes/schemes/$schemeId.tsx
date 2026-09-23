import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, ExternalLink, Loader2, XCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { fetchProfile, fetchScheme } from "@/lib/api";
import { checkEligibility, formatDate, isExpired } from "@/lib/eligibility";

export const Route = createFileRoute("/schemes/$schemeId")({
  head: () => ({
    meta: [
      { title: "Scheme Details — YojanaSetu" },
      {
        name: "description",
        content: "Read the benefits, eligibility rules and documents needed for this sample scheme.",
      },
      { property: "og:title", content: "Scheme Details — YojanaSetu" },
      {
        property: "og:description",
        content: "Eligibility result based on your saved profile, with benefits and documents.",
      },
    ],
  }),
  component: SchemeDetailPage,
});

function SchemeDetailPage() {
  const { schemeId } = Route.useParams();
  const { user } = useAuth();

  const { data: scheme, isLoading } = useQuery({
    queryKey: ["scheme", schemeId],
    queryFn: () => fetchScheme(schemeId),
  });
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: Boolean(user),
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="grid min-h-[50vh] place-items-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!scheme) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="text-xl font-semibold">Scheme not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This scheme may have been removed from the sample database.
          </p>
          <Button asChild className="mt-5">
            <Link to="/schemes">Back to schemes</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const result = checkEligibility(profile ?? null, scheme);
  const expired = isExpired(scheme);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{scheme.category}</Badge>
          <Badge variant="secondary">{scheme.state}</Badge>
          {scheme.is_demo && <Badge variant="outline">Sample scheme</Badge>}
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold">{scheme.scheme_name}</h1>
        <p className="mt-3 text-muted-foreground">{scheme.description}</p>

        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your eligibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Eligibility result based on your saved profile.
            </p>
            {!profile && (
              <p className="text-sm">
                <Link to="/profile" className="text-primary underline">
                  Create your profile
                </Link>{" "}
                to see whether you qualify.
              </p>
            )}
            {profile && result.eligible && (
              <p className="flex items-center gap-2 text-sm font-medium text-success">
                <CheckCircle2 className="size-4" /> You appear eligible for this scheme.
              </p>
            )}
            {profile && !result.eligible && (
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <XCircle className="size-4" /> You do not appear eligible right now.
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {result.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Benefit</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{scheme.benefit}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Documents needed</CardTitle>
            </CardHeader>
            <CardContent>
              {scheme.required_documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents listed.</p>
              ) : (
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {scheme.required_documents.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          Last date to apply: {formatDate(scheme.application_deadline)}
          {expired && <span className="font-medium text-destructive">(closed)</span>}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild disabled={expired}>
            <Link to="/apply/$schemeId" params={{ schemeId: scheme.id }}>
              Apply Now
            </Link>
          </Button>
          {scheme.official_url && (
            <Button asChild variant="outline">
              <a href={scheme.official_url} target="_blank" rel="noreferrer">
                Official information <ExternalLink className="size-4" />
              </a>
            </Button>
          )}
        </div>

        <p className="mt-8 rounded-lg bg-secondary p-4 text-xs text-muted-foreground">
          This is a prototype for academic demonstration. Scheme details are sample data and are not
          connected to any live government system.
        </p>
      </div>
    </AppShell>
  );
}
