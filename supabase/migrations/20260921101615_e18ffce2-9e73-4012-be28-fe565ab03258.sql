
-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  full_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  state TEXT,
  district TEXT,
  annual_income NUMERIC,
  social_category TEXT,
  occupation_type TEXT,
  education_level TEXT,
  course TEXT,
  institution TEXT,
  year_of_study TEXT,
  area_type TEXT,
  disability BOOLEAN NOT NULL DEFAULT false,
  farmer BOOLEAN NOT NULL DEFAULT false,
  employment_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SCHEMES
CREATE TABLE public.schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_name TEXT NOT NULL,
  description TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'All India',
  category TEXT NOT NULL DEFAULT 'General',
  benefit TEXT NOT NULL,
  age_min INT,
  age_max INT,
  income_max NUMERIC,
  education_requirement TEXT[] NOT NULL DEFAULT '{}',
  student_required BOOLEAN NOT NULL DEFAULT false,
  gender_requirement TEXT,
  category_requirement TEXT[] NOT NULL DEFAULT '{}',
  rural_required BOOLEAN NOT NULL DEFAULT false,
  disability_required BOOLEAN NOT NULL DEFAULT false,
  farmer_required BOOLEAN NOT NULL DEFAULT false,
  application_deadline DATE,
  official_url TEXT,
  required_documents TEXT[] NOT NULL DEFAULT '{}',
  scheme_specific_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_demo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ADMIN USERS
CREATE TABLE public.admin_users (
  user_id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheme_id UUID REFERENCES public.schemes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- APPLICATIONS
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
  application_ref TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'Submitted',
  profile_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  extra_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- APPLICATION DOCUMENTS (prototype placeholders)
CREATE TABLE public.application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  file_name TEXT,
  status TEXT NOT NULL DEFAULT 'Placeholder',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schemes TO authenticated;
GRANT SELECT ON public.schemes TO anon;
GRANT ALL ON public.schemes TO service_role;
GRANT SELECT, INSERT ON public.admin_users TO authenticated;
GRANT ALL ON public.admin_users TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_documents TO authenticated;
GRANT ALL ON public.application_documents TO service_role;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.owns_profile(_profile_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = _profile_id AND p.user_id = auth.uid());
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (is_demo AND public.is_admin(auth.uid())));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own profile delete" ON public.profiles FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "schemes public read" ON public.schemes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage schemes insert" ON public.schemes FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "admins manage schemes update" ON public.schemes FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "admins manage schemes delete" ON public.schemes FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "read own admin row" ON public.admin_users FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "self enroll demo admin" ON public.admin_users FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "own notifications select" ON public.notifications FOR SELECT TO authenticated
  USING (public.owns_profile(profile_id) OR public.is_admin(auth.uid()));
CREATE POLICY "own notifications update" ON public.notifications FOR UPDATE TO authenticated
  USING (public.owns_profile(profile_id)) WITH CHECK (public.owns_profile(profile_id));
CREATE POLICY "own notifications delete" ON public.notifications FOR DELETE TO authenticated
  USING (public.owns_profile(profile_id));

CREATE POLICY "own applications select" ON public.applications FOR SELECT TO authenticated
  USING (public.owns_profile(profile_id));
CREATE POLICY "own applications insert" ON public.applications FOR INSERT TO authenticated
  WITH CHECK (public.owns_profile(profile_id));
CREATE POLICY "own applications update" ON public.applications FOR UPDATE TO authenticated
  USING (public.owns_profile(profile_id)) WITH CHECK (public.owns_profile(profile_id));

CREATE POLICY "own app docs select" ON public.application_documents FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.applications a WHERE a.id = application_id AND public.owns_profile(a.profile_id)));
CREATE POLICY "own app docs insert" ON public.application_documents FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.applications a WHERE a.id = application_id AND public.owns_profile(a.profile_id)));

-- updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ELIGIBILITY ENGINE (mirrors the frontend engine)
CREATE OR REPLACE FUNCTION public.profile_matches_scheme(p public.profiles, s public.schemes)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SET search_path = public AS $$
DECLARE age INT;
BEGIN
  IF p.date_of_birth IS NULL THEN RETURN false; END IF;
  age := date_part('year', age(p.date_of_birth))::int;
  IF s.age_min IS NOT NULL AND age < s.age_min THEN RETURN false; END IF;
  IF s.age_max IS NOT NULL AND age > s.age_max THEN RETURN false; END IF;
  IF s.state IS NOT NULL AND s.state <> 'All India' AND coalesce(p.state,'') <> s.state THEN RETURN false; END IF;
  IF s.income_max IS NOT NULL AND coalesce(p.annual_income, 1e12) > s.income_max THEN RETURN false; END IF;
  IF array_length(s.education_requirement,1) IS NOT NULL AND NOT (coalesce(p.education_level,'') = ANY(s.education_requirement)) THEN RETURN false; END IF;
  IF s.student_required AND coalesce(p.occupation_type,'') <> 'Student' THEN RETURN false; END IF;
  IF s.gender_requirement IS NOT NULL AND s.gender_requirement <> 'Any' AND coalesce(p.gender,'') <> s.gender_requirement THEN RETURN false; END IF;
  IF array_length(s.category_requirement,1) IS NOT NULL AND NOT (coalesce(p.social_category,'') = ANY(s.category_requirement)) THEN RETURN false; END IF;
  IF s.rural_required AND coalesce(p.area_type,'') <> 'Rural' THEN RETURN false; END IF;
  IF s.disability_required AND NOT p.disability THEN RETURN false; END IF;
  IF s.farmer_required AND NOT p.farmer THEN RETURN false; END IF;
  RETURN true;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_eligible_users() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.profiles;
BEGIN
  FOR p IN SELECT * FROM public.profiles LOOP
    IF public.profile_matches_scheme(p, NEW) THEN
      INSERT INTO public.notifications (profile_id, scheme_id, title, body)
      VALUES (p.id, NEW.id, '🔔 New Scheme Match',
        'You appear eligible for ' || NEW.scheme_name || '. Benefit: ' || NEW.benefit ||
        coalesce('. Deadline: ' || to_char(NEW.application_deadline, 'DD Mon YYYY'), ''));
    END IF;
  END LOOP;
  RETURN NEW;
END; $$;

CREATE TRIGGER schemes_notify_after_insert AFTER INSERT ON public.schemes
FOR EACH ROW EXECUTE FUNCTION public.notify_eligible_users();

-- DEMO SCHEMES
INSERT INTO public.schemes (scheme_name, description, state, category, benefit, age_min, age_max, income_max, education_requirement, student_required, gender_requirement, category_requirement, rural_required, disability_required, farmer_required, application_deadline, official_url, required_documents, scheme_specific_fields) VALUES
('National Merit Scholarship (Demo)','Sample merit-based scholarship for undergraduate students from low-income families.','All India','Education','Up to ₹20,000 per year towards tuition fees',17,25,300000,'{Undergraduate}',true,'Any','{}',false,false,false,'2026-12-31','https://scholarships.gov.in','{Income Certificate,Marksheet,Institution ID Card}','[{"key":"last_exam_percentage","label":"Percentage in last examination","type":"number","required":true},{"key":"scholarship_certificate_no","label":"Previous scholarship certificate number (if any)","type":"text","required":false}]'),
('Post Matric Scholarship for SC/ST (Demo)','Sample scholarship supporting SC and ST students after class 10.','All India','Education','Tuition reimbursement and monthly maintenance allowance',15,30,250000,'{Class 12,Undergraduate,Postgraduate}',true,'Any','{SC,ST}',false,false,false,'2026-11-30','https://scholarships.gov.in','{Caste Certificate,Income Certificate,Admission Proof}','[{"key":"caste_certificate_no","label":"Caste certificate number","type":"text","required":true}]'),
('Girl Child Higher Education Support (Demo)','Sample scheme encouraging girls to continue higher education.','All India','Women Empowerment','One-time grant of ₹25,000',17,28,400000,'{Undergraduate,Postgraduate}',true,'Female','{}',false,false,false,'2026-10-15','https://wcd.gov.in','{Institution ID Card,Income Certificate,Bank Passbook Copy}','[{"key":"course_duration","label":"Total duration of your course (years)","type":"number","required":true}]'),
('Rural Skill Development Programme (Demo)','Sample free skill training programme for rural youth.','All India','Skill Development','Free training plus ₹1,500 monthly stipend',18,35,200000,'{}',false,'Any','{}',true,false,false,'2026-09-30','https://ddugky.gov.in','{Residence Proof,Income Certificate}','[{"key":"preferred_trade","label":"Preferred training trade","type":"text","required":true}]'),
('Divyangjan Assistive Support Scheme (Demo)','Sample scheme providing assistive devices to persons with disabilities.','All India','Disability Welfare','Assistive devices worth up to ₹15,000',5,70,300000,'{}',false,'Any','{}',false,true,false,'2026-12-01','https://disabilityaffairs.gov.in','{Disability Certificate,Income Certificate}','[{"key":"device_required","label":"Assistive device required","type":"text","required":true}]'),
('Small Farmer Input Assistance (Demo)','Sample income support for small and marginal farmer families.','All India','Agriculture','₹6,000 per year in three instalments',18,75,250000,'{}',false,'Any','{}',false,false,true,'2026-08-31','https://pmkisan.gov.in','{Land Record,Residence Proof}','[{"key":"land_area_acres","label":"Cultivated land area (acres)","type":"number","required":true}]'),
('Maharashtra Student Laptop Support (Demo)','Sample state scheme helping Maharashtra students buy a laptop for studies.','Maharashtra','Education','Subsidy of ₹15,000 towards a laptop',18,26,300000,'{Undergraduate,Postgraduate}',true,'Any','{}',false,false,false,'2026-07-31','https://maharashtra.gov.in','{Institution ID Card,Income Certificate,Domicile Certificate}','[{"key":"institution_code","label":"Institution code","type":"text","required":true}]'),
('Karnataka Youth Employment Grant (Demo)','Sample state scheme supporting unemployed graduates while they look for work.','Karnataka','Employment','₹3,000 monthly allowance for up to 12 months',21,30,300000,'{Undergraduate,Postgraduate}',false,'Any','{}',false,false,false,'2026-10-31','https://karnataka.gov.in','{Degree Certificate,Employment Exchange Registration}','[{"key":"registration_no","label":"Employment exchange registration number","type":"text","required":true}]'),
('OBC Coaching Assistance (Demo)','Sample scheme funding competitive exam coaching for OBC candidates.','All India','Education','Coaching fee support up to ₹40,000',18,32,350000,'{Undergraduate,Postgraduate}',false,'Any','{OBC}',false,false,false,'2026-11-15','https://socialjustice.gov.in','{Caste Certificate,Income Certificate}','[{"key":"target_exam","label":"Examination you are preparing for","type":"text","required":true}]'),
('Senior Citizen Welfare Support (Demo)','Sample monthly pension support for low-income senior citizens.','All India','Social Welfare','₹1,000 monthly pension',60,120,150000,'{}',false,'Any','{}',false,false,false,'2026-12-31','https://nsap.nic.in','{Age Proof,Income Certificate}','[{"key":"pension_preference","label":"Preferred disbursement frequency","type":"text","required":true}]');

-- DEMO PROFILES
INSERT INTO public.profiles (is_demo, full_name, date_of_birth, gender, state, district, annual_income, social_category, occupation_type, education_level, course, institution, year_of_study, area_type, disability, farmer, employment_status) VALUES
(true,'Demo User - Aarti Deshmukh','2007-04-12','Female','Maharashtra','Pune',200000,'OBC','Student','Undergraduate','B.Sc Computer Science','Fergusson College','Second Year','Urban',false,false,'Not employed'),
(true,'Demo User - Rahul Patil','2005-01-20','Male','Maharashtra','Nashik',280000,'General','Student','Undergraduate','B.Com','K K Wagh College','Third Year','Rural',false,false,'Not employed'),
(true,'Demo User - Sunita Rao','1996-06-08','Female','Karnataka','Mysuru',250000,'SC','Other','Postgraduate','M.A Economics','University of Mysore','Completed','Urban',false,false,'Unemployed'),
(true,'Demo User - Imran Shaikh','1985-09-02','Male','Maharashtra','Latur',180000,'OBC','Working','Class 12',NULL,NULL,NULL,'Rural',false,true,'Self employed'),
(true,'Demo User - Meera Nair','1958-03-25','Female','Kerala','Kochi',120000,'General','Other',NULL,NULL,NULL,NULL,'Urban',true,false,'Retired');
