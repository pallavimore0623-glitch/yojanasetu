import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, SearchX } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SchemeCard } from "@/components/SchemeCard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { fetchProfile, fetchSchemes } from "@/lib/api";
import {
  EDUCATION_LEVELS,
  SCHEME_CATEGORIES,
  STATES,
  checkEligibility,
} from "@/lib/eligibility";

export const Route = createFileRoute("/schemes/")({
  head: () => ({
    meta: [
      { title: "All Schemes — YojanaSetu" },
      {
        name: "description",
        content: "Search and filter sample government schemes by state, category and education level.",
      },
      { property: "og:title", content: "All Schemes — YojanaSetu" },
      {
        property: "og:description",
        content: "Browse demo government schemes and see which ones match your saved profile.",
      },
    ],
  }),
  component: SchemesPage,
});

const ANY = "Any";

function SchemesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [state, setState] = useState(ANY);
  const [category, setCategory] = useState(ANY);
  const [education, setEducation] = useState(ANY);
  const [studentsOnly, setStudentsOnly] = useState(false);
  const [eligibleOnly, setEligibleOnly] = useState(false);

  const { data: schemes = [], isLoading } = useQuery({ queryKey: ["schemes"], queryFn: fetchSchemes });
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: Boolean(user),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return schemes
      .map((s) => ({ scheme: s, result: checkEligibility(profile ?? null, s) }))
      .filter(({ scheme, result }) => {
        if (term && !`${scheme.scheme_name} ${scheme.benefit} ${scheme.description}`.toLowerCase().includes(term))
          return false;
        if (state !== ANY && scheme.state !== state) return false;
        if (category !== ANY && scheme.category !== category) return false;
        if (education !== ANY && !scheme.education_requirement.includes(education)) return false;
        if (studentsOnly && !scheme.student_required) return false;
        if (eligibleOnly && !result.eligible) return false;
        return true;
      });
  }, [schemes, profile, search, state, category, education, studentsOnly, eligibleOnly]);

  function reset() {
    setSearch("");
    setState(ANY);
    setCategory(ANY);
    setEducation(ANY);
    setStudentsOnly(false);
    setEligibleOnly(false);
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold md:text-3xl">Government Schemes</h1>
        <p className="mt-2 text-muted-foreground">
          Sample scheme database for demonstration. Verify details on the official portal before
          applying.
        </p>

        <Card className="mt-6 shadow-card">
          <CardContent className="grid gap-4 pt-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="search">Search by scheme name or benefit</Label>
              <Input
                id="search"
                value={search}
                maxLength={80}
                placeholder="e.g. scholarship, laptop, pension"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>All states</SelectItem>
                  {STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>All categories</SelectItem>
                  {SCHEME_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Education requirement</Label>
              <Select value={education} onValueChange={setEducation}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>Any education level</SelectItem>
                  {EDUCATION_LEVELS.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5">
              <Label htmlFor="students" className="cursor-pointer">
                Only student schemes
              </Label>
              <Switch id="students" checked={studentsOnly} onCheckedChange={setStudentsOnly} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5">
              <Label htmlFor="eligible" className="cursor-pointer">
                Only show schemes I'm eligible for
              </Label>
              <Switch
                id="eligible"
                checked={eligibleOnly}
                onCheckedChange={setEligibleOnly}
                disabled={!profile}
              />
            </div>
            <div className="flex items-end">
              <Button variant="ghost" onClick={reset} className="w-full">
                Clear filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {!user && (
          <p className="mt-4 text-sm text-muted-foreground">
            Sign in and save your profile to see personal eligibility results on each card.
          </p>
        )}

        {isLoading ? (
          <div className="grid min-h-[30vh] place-items-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="mt-6 shadow-card">
            <CardContent className="py-12 text-center">
              <SearchX className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 font-medium">No matching schemes found.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try removing a filter or complete your profile to improve matching.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(({ scheme, result }) => (
              <SchemeCard key={scheme.id} scheme={scheme} result={profile ? result : null} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
