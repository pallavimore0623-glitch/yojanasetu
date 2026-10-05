CREATE POLICY "admins read all notifications" ON public.notifications FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.rerun_scheme_matching(_scheme_id uuid) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.profiles; s public.schemes; n integer := 0;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Admins only'; END IF;
  SELECT * INTO s FROM public.schemes WHERE id = _scheme_id;
  IF s.id IS NULL THEN RAISE EXCEPTION 'Scheme not found'; END IF;
  FOR p IN SELECT * FROM public.profiles LOOP
    IF public.profile_matches_scheme(p, s) AND NOT EXISTS (
      SELECT 1 FROM public.notifications WHERE profile_id = p.id AND scheme_id = s.id) THEN
      INSERT INTO public.notifications (profile_id, scheme_id, title, body)
      VALUES (p.id, s.id, '🔔 New Scheme Match',
        'You appear eligible for ' || s.scheme_name || '. Benefit: ' || s.benefit ||
        coalesce('. Deadline: ' || to_char(s.application_deadline, 'DD Mon YYYY'), ''));
      n := n + 1;
    END IF;
  END LOOP;
  RETURN n;
END; $$;
REVOKE ALL ON FUNCTION public.rerun_scheme_matching(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rerun_scheme_matching(uuid) TO authenticated;