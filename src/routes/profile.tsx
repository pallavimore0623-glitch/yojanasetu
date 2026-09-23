import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchProfile } from "@/lib/api";
import {
  AREA_TYPES,
  EDUCATION_LEVELS,
  EMPLOYMENT_STATUSES,
  GENDERS,
  OCCUPATION_TYPES,
  SOCIAL_CATEGORIES,
  STATES,
  profileCompletion,
  type Profile,
} from "@/lib/eligibility";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — YojanaSetu" },
      {
        name: "description",
        content: "Save your details once so YojanaSetu can match you with eligible schemes.",
      },
      { property: "og:title", content: "My Profile — YojanaSetu" },
      {
        property: "og:description",
        content: "Your one-time profile powers eligibility matching and pre-filled applications.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <RequireAuth>
        <ProfilePage />
      </RequireAuth>
    </AppShell>
  ),
});

type FormState = Omit<Profile, "id" | "user_id" | "is_demo" | "created_at" | "updated_at"> & {
  annual_income: number | null;
};

const EMPTY: FormState = {
  full_name: "",
  date_of_birth: "",
  gender: "",
  state: "",
  district: "",
  annual_income: null,
  social_category: "",
  occupation_type: "",
  education_level: "",
  course: "",
  institution: "",
  year_of_study: "",
  area_type: "",
  disability: false,
  farmer: false,
  employment_status: "",
};

const schema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(100),
  date_of_birth: z.string().min(1, "Please select your date of birth"),
  gender: z.string().min(1, "Please select your gender"),
  state: z.string().min(1, "Please select your state"),
  district: z.string().trim().min(2, "Please enter your district").max(80),
  annual_income: z
    .number({ message: "Please enter your annual family income" })
    .min(0, "Income cannot be negative")
    .max(100000000),
  social_category: z.string().min(1, "Please select your social category"),
  occupation_type: z.string().min(1, "Please select what you currently do"),
  area_type: z.string().min(1, "Please select rural or urban"),
});

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select {...(value ? { value } : {})} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder ?? "Select"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(EMPTY);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        date_of_birth: profile.date_of_birth ?? "",
        gender: profile.gender ?? "",
        state: profile.state ?? "",
        district: profile.district ?? "",
        annual_income: profile.annual_income,
        social_category: profile.social_category ?? "",
        occupation_type: profile.occupation_type ?? "",
        education_level: profile.education_level ?? "",
        course: profile.course ?? "",
        institution: profile.institution ?? "",
        year_of_study: profile.year_of_study ?? "",
        area_type: profile.area_type ?? "",
        disability: profile.disability,
        farmer: profile.farmer,
        employment_status: profile.employment_status ?? "",
      });
    }
  }, [profile]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        user_id: user!.id,
        annual_income: form.annual_income,
      };
      if (profile) {
        const { error } = await supabase.from("profiles").update(payload).eq("id", profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("profiles").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success("Profile saved. We are matching schemes for you.");
      navigate({ to: "/dashboard" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save your profile"),
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please complete the required fields");
      return;
    }
    save.mutate();
  }

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const completion = profileCompletion({ ...(profile ?? ({} as Profile)), ...form } as Profile);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold md:text-3xl">My Profile</h1>
      <p className="mt-2 text-muted-foreground">
        Fill this once. Every scheme check and application form will reuse these details.
      </p>

      <Card className="mt-6 shadow-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Profile completion</span>
            <span className="font-semibold text-primary">{completion}%</span>
          </div>
          <Progress value={completion} className="mt-3" />
        </CardContent>
      </Card>

      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Basic details</CardTitle>
            <CardDescription>Used to check age, state and income based criteria.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={form.full_name ?? ""}
                maxLength={100}
                onChange={(e) => set("full_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={form.date_of_birth ?? ""}
                onChange={(e) => set("date_of_birth", e.target.value)}
              />
            </div>
            <SelectField
              label="Gender"
              value={form.gender ?? ""}
              onChange={(v) => set("gender", v)}
              options={GENDERS}
            />
            <SelectField
              label="State"
              value={form.state ?? ""}
              onChange={(v) => set("state", v)}
              options={STATES.filter((s) => s !== "All India")}
            />
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                value={form.district ?? ""}
                maxLength={80}
                onChange={(e) => set("district", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="income">Annual Family Income (₹)</Label>
              <Input
                id="income"
                type="number"
                min={0}
                value={form.annual_income ?? ""}
                onChange={(e) =>
                  set("annual_income", e.target.value === "" ? null : Number(e.target.value))
                }
              />
            </div>
            <SelectField
              label="Social Category"
              value={form.social_category ?? ""}
              onChange={(v) => set("social_category", v)}
              options={SOCIAL_CATEGORIES}
            />
            <SelectField
              label="Area"
              value={form.area_type ?? ""}
              onChange={(v) => set("area_type", v)}
              options={AREA_TYPES}
            />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Education & occupation</CardTitle>
            <CardDescription>Many schemes are only for students or specific courses.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Student / Working / Other"
              value={form.occupation_type ?? ""}
              onChange={(v) => set("occupation_type", v)}
              options={OCCUPATION_TYPES}
            />
            <SelectField
              label="Education Level"
              value={form.education_level ?? ""}
              onChange={(v) => set("education_level", v)}
              options={EDUCATION_LEVELS}
            />
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Input
                id="course"
                value={form.course ?? ""}
                maxLength={100}
                placeholder="e.g. B.Sc Computer Science"
                onChange={(e) => set("course", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">College / Institution</Label>
              <Input
                id="institution"
                value={form.institution ?? ""}
                maxLength={120}
                onChange={(e) => set("institution", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year of Study</Label>
              <Input
                id="year"
                value={form.year_of_study ?? ""}
                maxLength={40}
                placeholder="e.g. Second Year"
                onChange={(e) => set("year_of_study", e.target.value)}
              />
            </div>
            <SelectField
              label="Employment Status"
              value={form.employment_status ?? ""}
              onChange={(v) => set("employment_status", v)}
              options={EMPLOYMENT_STATUSES}
            />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Special categories</CardTitle>
            <CardDescription>Some schemes are reserved for these groups.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium">Person with disability</p>
                <p className="text-sm text-muted-foreground">
                  Select yes if you hold a disability certificate.
                </p>
              </div>
              <Switch
                checked={form.disability}
                onCheckedChange={(v) => set("disability", v)}
                aria-label="Disability status"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium">Farmer family</p>
                <p className="text-sm text-muted-foreground">
                  Select yes if your family owns or cultivates farm land.
                </p>
              </div>
              <Switch
                checked={form.farmer}
                onCheckedChange={(v) => set("farmer", v)}
                aria-label="Farmer status"
              />
            </div>
          </CardContent>
        </Card>

        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          We do not collect Aadhaar numbers, bank account numbers or any other highly sensitive
          information in this prototype.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg" disabled={save.isPending}>
            {save.isPending && <Loader2 className="size-4 animate-spin" />}
            {profile ? "Update Profile" : "Save Profile"}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => navigate({ to: "/dashboard" })}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
