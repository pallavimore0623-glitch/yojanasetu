import { Link } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, FileCheck2, IndianRupee, MapPin, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate, isExpired, type EligibilityResult, type Scheme } from "@/lib/eligibility";

export function EligibilityBadge({ result }: { result: EligibilityResult | null }) {
  if (!result) return null;
  return result.eligible ? (
    <Badge className="gap-1 bg-success text-success-foreground hover:bg-success">
      <CheckCircle2 className="size-3.5" /> You appear eligible
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1 border-border text-muted-foreground">
      <XCircle className="size-3.5" /> Not matching yet
    </Badge>
  );
}

export function SchemeCard({
  scheme,
  result,
  showApply = true,
}: {
  scheme: Scheme;
  result?: EligibilityResult | null;
  showApply?: boolean;
}) {
  const expired = isExpired(scheme);

  return (
    <Card className="flex h-full flex-col shadow-card transition-shadow hover:shadow-lift">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{scheme.category}</Badge>
          <Badge variant="outline" className="gap-1">
            <MapPin className="size-3" /> {scheme.state}
          </Badge>
          {scheme.is_demo && <Badge className="bg-saffron text-primary-foreground hover:bg-saffron">Demo</Badge>}
          {expired && <Badge variant="destructive">Closed</Badge>}
        </div>
        <h3 className="font-display text-lg leading-snug font-semibold">{scheme.scheme_name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{scheme.description}</p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="rounded-lg bg-primary-soft p-3">
          <p className="flex items-start gap-2 text-sm font-medium text-primary">
            <IndianRupee className="mt-0.5 size-4 shrink-0" /> {scheme.benefit}
          </p>
        </div>

        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4" /> Last date: {formatDate(scheme.application_deadline)}
        </p>

        {scheme.required_documents.length > 0 && (
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <FileCheck2 className="mt-0.5 size-4 shrink-0" />
            <span>{scheme.required_documents.join(", ")}</span>
          </p>
        )}

        {result && (
          <div>
            <EligibilityBadge result={result} />
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/schemes/$schemeId" params={{ schemeId: scheme.id }}>
              View Details
            </Link>
          </Button>
          {showApply && (
            <Button asChild size="sm" disabled={expired}>
              <Link to="/apply/$schemeId" params={{ schemeId: scheme.id }}>
                Apply Now
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
