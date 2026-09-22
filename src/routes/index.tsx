import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlarmClock,
  ArrowRight,
  BadgeCheck,
  BellRing,
  ClipboardCheck,
  Clock3,
  FileSearch,
  Info,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YojanaSetu — One Profile. All Eligible Schemes." },
      {
        name: "description",
        content:
          "Create one profile and YojanaSetu shows the government schemes you appear eligible for, alerts you about new ones and pre-fills your application.",
      },
      { property: "og:title", content: "YojanaSetu — One Profile. All Eligible Schemes." },
      {
        property: "og:description",
        content:
          "A prototype that matches Indian citizens with government schemes using a single saved profile.",
      },
    ],
  }),
  component: Landing,
});

const STEPS = [
  {
    icon: UserPlus,
    title: "Create Profile",
    text: "Fill your basic and education details only once.",
  },
  {
    icon: FileSearch,
    title: "Check Eligibility",
    text: "Our engine compares your profile with every scheme.",
  },
  {
    icon: BellRing,
    title: "Get Notification",
    text: "When a new matching scheme is added, you are alerted.",
  },
  {
    icon: ClipboardCheck,
    title: "Apply Easily",
    text: "Your form comes pre-filled. Answer only what is new.",
  },
];

const BENEFITS = [
  { icon: Sparkles, title: "Personalized", text: "You see only schemes that match your details." },
  { icon: Clock3, title: "Time-saving", text: "No repeating the same details in every form." },
  { icon: BadgeCheck, title: "One-time profile", text: "Save once, reuse for every application." },
  { icon: AlarmClock, title: "Eligibility alerts", text: "Know the moment a new scheme fits you." },
];

function Landing() {
  return (
    <AppShell>
      <section className="gradient-hero relative overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Badge className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/15">
              Prototype for academic demonstration
            </Badge>
            <h1 className="mt-5 text-4xl leading-tight font-bold text-primary-foreground md:text-5xl">
              One Profile.
              <br />
              All Eligible Schemes.
            </h1>
            <p className="mt-5 max-w-xl text-base text-primary-foreground/85 md:text-lg">
              Thousands of government schemes exist, but most citizens never learn which ones they
              qualify for. YojanaSetu saves your details once, checks them against every scheme and
              tells you what you can apply for.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/schemes">
                  Find My Schemes <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link to="/auth">Create Free Profile</Link>
              </Button>
            </div>
          </div>

          <Card className="shadow-lift">
            <CardContent className="space-y-4 pt-6">
              <p className="text-sm font-semibold text-primary">Sample eligibility check</p>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Profile</p>
                <p className="mt-1 text-sm font-medium">
                  19 years · Maharashtra · Student · Undergraduate · Family income ₹2,00,000
                </p>
              </div>
              <div className="rounded-lg bg-primary-soft p-4">
                <p className="text-sm font-semibold text-primary">🔔 New Scheme Match</p>
                <p className="mt-1 text-sm text-foreground">
                  You appear eligible for Student Technology Support Scheme.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Benefit: Laptop / tablet support · Deadline: 31 Dec 2026
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Sample data shown for demonstration purposes.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold md:text-3xl">How It Works</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Four simple steps, in plain language. No repeated paperwork.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Card key={s.title} className="h-full shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
                    <s.icon className="size-5" />
                  </span>
                  <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="gradient-soft">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold md:text-3xl">Why citizens use YojanaSetu</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <Card key={b.title} className="h-full border-border/70 bg-card/80 shadow-card">
                <CardContent className="pt-6">
                  <b.icon className="size-6 text-primary" />
                  <h3 className="mt-3 text-base font-semibold">{b.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{b.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-warning/40 bg-warning/10 p-6 sm:flex-row">
          <Info className="mt-0.5 size-5 shrink-0 text-warning-foreground" />
          <div>
            <p className="font-semibold text-warning-foreground">Important disclaimer</p>
            <p className="mt-1 text-sm text-warning-foreground/90">
              This prototype is for demonstration. Always verify scheme details on the official
              government portal before applying. Scheme information shown here is sample data and is
              not a live connection to any government system.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
