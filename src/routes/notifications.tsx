import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchNotifications, fetchProfile } from "@/lib/api";
import { formatDate } from "@/lib/eligibility";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Scheme Alerts — YojanaSetu" },
      {
        name: "description",
        content: "See alerts for new schemes that match your saved YojanaSetu profile.",
      },
      { property: "og:title", content: "Scheme Alerts — YojanaSetu" },
      {
        property: "og:description",
        content: "New scheme matches, benefits and last dates, based on your saved profile.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <RequireAuth>
        <NotificationsPage />
      </RequireAuth>
    </AppShell>
  ),
});

function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: Boolean(user),
  });
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", profile?.id],
    queryFn: () => fetchNotifications(profile!.id),
    enabled: Boolean(profile),
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", profile?.id] }),
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Scheme Alerts</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You only get an alert when a newly added scheme matches your saved profile.
      </p>

      {isLoading && (
        <div className="grid min-h-[30vh] place-items-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && (notifications ?? []).length === 0 && (
        <Card className="mt-6">
          <CardContent className="grid place-items-center gap-3 py-12 text-center">
            <Bell className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No alerts yet.</p>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 space-y-3">
        {(notifications ?? []).map((n) => (
          <Card key={n.id} className={n.is_read ? "" : "border-primary/40 bg-primary-soft/40"}>
            <CardContent className="space-y-2 py-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{n.title}</p>
                {!n.is_read && <Badge>New</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{n.body}</p>
              <p className="text-xs text-muted-foreground">{formatDate(n.created_at)}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {n.scheme_id && (
                  <Button asChild size="sm" variant="outline">
                    <Link to="/schemes/$schemeId" params={{ schemeId: n.scheme_id }}>
                      View scheme
                    </Link>
                  </Button>
                )}
                {!n.is_read && (
                  <Button size="sm" variant="ghost" onClick={() => markRead.mutate(n.id)}>
                    Mark as read
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
