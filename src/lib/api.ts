import { supabase } from "@/integrations/supabase/client";
import type { Profile, Scheme } from "./eligibility";

export interface NotificationRow {
  id: string;
  profile_id: string;
  scheme_id: string | null;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface ApplicationRow {
  id: string;
  profile_id: string;
  scheme_id: string;
  application_ref: string;
  status: string;
  profile_snapshot: Record<string, unknown>;
  extra_answers: Record<string, unknown>;
  consent_given: boolean;
  submitted_at: string;
  created_at: string;
  schemes?: { scheme_name: string; benefit: string } | null;
}

export async function fetchSchemes(): Promise<Scheme[]> {
  const { data, error } = await supabase
    .from("schemes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Scheme[];
}

export async function fetchScheme(id: string): Promise<Scheme | null> {
  const { data, error } = await supabase.from("schemes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as unknown as Scheme) ?? null;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as Profile) ?? null;
}

export async function fetchNotifications(profileId: string): Promise<NotificationRow[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as NotificationRow[];
}

export async function fetchApplications(profileId: string): Promise<ApplicationRow[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("*, schemes(scheme_name, benefit)")
    .eq("profile_id", profileId)
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ApplicationRow[];
}

export async function fetchIsAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
