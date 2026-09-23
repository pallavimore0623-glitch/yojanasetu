import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchIsAdmin, fetchSchemes } from "@/lib/api";
import { formatDate } from "@/lib/eligibility";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Demo Admin — YojanaSetu" },
      {
        name: "description",
        content: "Add sample schemes and watch matching alerts reach eligible demo profiles.",
      },
      { property: "og:title", content: "Demo Admin — YojanaSetu" },
      {
        property: "og:description",
        content: "Prototype admin area for adding schemes and reviewing generated alerts.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <RequireAuth>
        <AdminPage />
      </RequireAuth>
    </AppShell>
  ),
});

function AdminPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: () => fetchIsAdmin(user!.id),
    enabled: Boolean(user),
  });
  const { data: schemes } = useQuery({ queryKey: ["schemes"], queryFn: fetchSchemes });

  const [form, setForm] = useState({
    scheme_name: "",
    description: "",
    state: "All India",
    category: "Education",
    benefit: "",
    age_min: "",
    age_max: "",
    income_max: "",
    education_requirement: "",
    student_required: "no",
  });

  const enroll = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("admin_users").insert({ user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Demo admin access enabled.");
      queryClient.invalidateQueries({ queryKey: ["is-admin", user?.id] });
    },
    onError: () => toast.error("Could not enable demo admin access."),
  });

  const addScheme = useMutation({
    mutationFn: async () => {
      if (!form.scheme_name.trim() || !form.benefit.trim()) {
        throw new Error("Scheme name and benefit are required.");
      }
      const { error } = await supabase.from("schemes").insert({
        scheme_name: form.scheme_name.trim(),
        description: form.description.trim(),
        state: form.state,
        category: form.category,
        benefit: form.benefit.trim(),
        age_min: form.age_min ? Number(form.age_min) : null,
        age_max: form.age_max ? Number(form.age_max) : null,
        income_max: form.income_max ? Number(form.income_max) : null,
        education_requirement: form.education_requirement
          ? form.education_requirement.split(",").map((s) => s.trim())
          : [],
        student_required: form.student_required === "yes",
        is_demo: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Scheme added. Eligible profiles have been alerted.");
      setForm({ ...form, scheme_name: "", description: "", benefit: "" });
      queryClient.invalidateQueries({ queryKey: ["schemes"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not add the scheme."),
  });

  if (isLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <ShieldCheck className="mx-auto size-10 text-primary" />
        <h1 className="mt-4 text-xl font-semibold">Demo admin area</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This area is for the prototype demonstration only. Enable it to add sample schemes.
        </p>
        <Button className="mt-5" onClick={() => enroll.mutate()} disabled={enroll.isPending}>
          Enable demo admin access
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Demo Admin</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Adding a scheme automatically alerts every saved profile that matches it.
      </p>

      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Add a sample scheme</CardTitle>
          <CardDescription>All schemes added here are marked as sample data.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Scheme name</Label>
            <Input
              value={form.scheme_name}
              onChange={(e) => setForm({ ...form, scheme_name: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Benefit</Label>
            <Input
              value={form.benefit}
              onChange={(e) => setForm({ ...form, benefit: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Minimum age</Label>
            <Input
              type="number"
              value={form.age_min}
              onChange={(e) => setForm({ ...form, age_min: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Maximum age</Label>
            <Input
              type="number"
              value={form.age_max}
              onChange={(e) => setForm({ ...form, age_max: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Maximum family income</Label>
            <Input
              type="number"
              value={form.income_max}
              onChange={(e) => setForm({ ...form, income_max: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Education levels (comma separated)</Label>
            <Input
              value={form.education_requirement}
              onChange={(e) => setForm({ ...form, education_requirement: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Students only? (yes / no)</Label>
            <Input
              value={form.student_required}
              onChange={(e) => setForm({ ...form, student_required: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Button onClick={() => addScheme.mutate()} disabled={addScheme.isPending}>
              {addScheme.isPending && <Loader2 className="size-4 animate-spin" />}
              Add scheme and notify matches
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">All schemes ({(schemes ?? []).length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(schemes ?? []).map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2 text-sm last:border-0"
            >
              <span className="font-medium">{s.scheme_name}</span>
              <span className="text-muted-foreground">
                {s.state} · added {formatDate(s.created_at)}
              </span>
              <Button asChild size="sm" variant="outline">
                <Link to="/schemes/$schemeId" params={{ schemeId: s.id }}>
                  View
                </Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
