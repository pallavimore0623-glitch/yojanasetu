import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchProfile, fetchScheme } from "@/lib/api";
import {
  checkEligibility,
  formatINR,
  generateApplicationRef,
  type Profile,
  type Scheme,
} from "@/lib/eligibility";

export const Route = createFileRoute("/apply/$schemeId")({
  head: () => ({
    meta: [
      { title: "Apply for a Scheme — YojanaSetu" },
      {
        name: "description",
        content: "Apply with your saved profile auto-filled, answer a few extra questions, submit.",
      },
      { property: "og:title", content: "Apply for a Scheme — YojanaSetu" },
      {
        property: "og:description",
        content: "A smart application form that reuses your profile to avoid repeated typing.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <RequireAuth>
        <ApplyPage />
      </RequireAuth>
    </AppShell>
  ),
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function ApplyPage() {
  const { schemeId } = Route.useParams();
  const { user } = useAuth();
  const [step, setStep] = useState<"form" | "review" | "done">("form");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [documents, setDocuments] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState("");

  const { data: scheme, isLoading } = useQuery({
    queryKey: ["scheme", schemeId],
    queryFn: () => fetchScheme(schemeId),
  });
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: Boolean(user),
  });

  if (isLoading || profileLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-xl font-semibold">Scheme not found</h1>
        <Button asChild className="mt-5">
          <Link to="/schemes">Back to schemes</Link>
        </Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-xl font-semibold">Complete your profile first</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your profile details are used to fill this application automatically.
        </p>
        <Button asChild className="mt-5">
          <Link to="/profile">Create Profile</Link>
        </Button>
      </div>
    );
  }

  const result = checkEligibility(profile, scheme);
  const fields = scheme.scheme_specific_fields ?? [];

  function goReview() {
    const missing = fields.filter((f) => f.required !== false && !answers[f.key]?.trim());
    if (missing.length > 0) {
      toast.error(`Please answer: ${missing.map((m) => m.label).join(", ")}`);
      return;
    }
    setStep("review");
  }

  async function submit(s: Scheme, p: Profile) {
    if (!consent) {
      toast.error("Please tick the consent box before submitting.");
      return;
    }
    setBusy(true);
    const ref = generateApplicationRef();
    const { error } = await supabase.from("applications").insert({
      profile_id: p.id,
      scheme_id: s.id,
      application_ref: ref,
      status: "Submitted",
      profile_snapshot: JSON.parse(JSON.stringify(p)),
      extra_answers: { ...answers, documents },
      consent_given: true,
    });
    setBusy(false);
    if (error) {
      toast.error("We could not submit the application. Please try again.");
      return;
    }
    setReference(ref);
    setStep("done");
  }

  if (step === "done") {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto size-12 text-success" />
        <h1 className="mt-4 font-display text-2xl font-bold">Application submitted</h1>
        <p className="mt-2 text-sm text-muted-foreground">{scheme.scheme_name}</p>
        <p className="mt-6 text-sm">
          Application ID: <span className="font-mono font-semibold">{reference}</span>
        </p>
        <p className="mt-1 text-sm">
          Status: <span className="font-semibold">Submitted</span>
        </p>
        <p className="mt-6 rounded-lg bg-secondary p-4 text-xs text-muted-foreground">
          This is a prototype for academic demonstration. Your application is stored only in this
          demo and is not sent to any government department.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link to="/applications">View My Applications</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">
        {step === "form" ? "Apply" : "Review Your Application"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{scheme.scheme_name}</p>

      {!result.eligible && (
        <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          Based on your saved profile you do not appear eligible. You may still continue in this
          demo, but a real application could be rejected.
        </p>
      )}

      {step === "form" && (
        <>
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Auto-filled from your profile</CardTitle>
              <CardDescription>
                Your saved profile information has been reused to reduce repetitive data entry.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Row label="Full name" value={profile.full_name ?? "Not provided"} />
              <Row label="Date of birth" value={profile.date_of_birth ?? "Not provided"} />
              <Row label="Gender" value={profile.gender ?? "Not provided"} />
              <Row
                label="State / District"
                value={`${profile.state ?? "-"} / ${profile.district ?? "-"}`}
              />
              <Row label="Annual family income" value={formatINR(profile.annual_income)} />
              <Row label="Social category" value={profile.social_category ?? "Not provided"} />
              <Row label="Education level" value={profile.education_level ?? "Not provided"} />
              <Row label="Occupation" value={profile.occupation_type ?? "Not provided"} />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Additional Information Required</CardTitle>
              <CardDescription>
                Only the details this scheme needs beyond your profile. Never share Aadhaar or bank
                account numbers in this prototype.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  This scheme needs no extra information.
                </p>
              )}
              {fields.map((f) => (
                <div key={f.key} className="space-y-2">
                  <Label htmlFor={f.key}>{f.label}</Label>
                  <Input
                    id={f.key}
                    type={f.type === "number" ? "number" : "text"}
                    value={answers[f.key] ?? ""}
                    onChange={(e) => setAnswers({ ...answers, [f.key]: e.target.value })}
                  />
                </div>
              ))}

              <div className="space-y-2">
                <Label>Documents (demo upload)</Label>
                {(scheme.required_documents ?? []).map((d) => (
                  <label
                    key={d}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-border px-3 py-2 text-sm"
                  >
                    <span>{d}</span>
                    <span className="flex items-center gap-1 text-primary">
                      <Upload className="size-4" />
                      {documents.includes(d) ? "Attached" : "Attach"}
                    </span>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={documents.includes(d)}
                      onChange={(e) =>
                        setDocuments(
                          e.target.checked
                            ? [...documents, d]
                            : documents.filter((x) => x !== d),
                        )
                      }
                    />
                  </label>
                ))}
                <p className="text-xs text-muted-foreground">
                  Document upload is a placeholder in this prototype. No file is stored.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button onClick={goReview}>Continue to review</Button>
          </div>
        </>
      )}

      {step === "review" && (
        <>
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Row label="Full name" value={profile.full_name ?? "Not provided"} />
              <Row label="Date of birth" value={profile.date_of_birth ?? "Not provided"} />
              <Row label="State" value={profile.state ?? "Not provided"} />
              <Row label="Annual family income" value={formatINR(profile.annual_income)} />
              <Row label="Education level" value={profile.education_level ?? "Not provided"} />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing extra was required.</p>
              ) : (
                fields.map((f) => (
                  <Row key={f.key} label={f.label} value={answers[f.key] ?? "Not provided"} />
                ))
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents attached (demo).</p>
              ) : (
                documents.map((d) => <Row key={d} label={d} value="Attached (demo)" />)
              )}
            </CardContent>
          </Card>

          <label className="mt-6 flex items-start gap-3 text-sm">
            <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} />
            <span>
              I confirm that the information provided is accurate and I consent to using my profile
              information for this application.
            </span>
          </label>

          <div className="mt-6 flex justify-between gap-3">
            <Button variant="outline" onClick={() => setStep("form")}>
              Back
            </Button>
            <Button onClick={() => submit(scheme, profile)} disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              Submit Application
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
