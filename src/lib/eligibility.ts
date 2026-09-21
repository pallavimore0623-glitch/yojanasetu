export interface Profile {
  id: string;
  user_id: string | null;
  is_demo: boolean;
  full_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  state: string | null;
  district: string | null;
  annual_income: number | null;
  social_category: string | null;
  occupation_type: string | null;
  education_level: string | null;
  course: string | null;
  institution: string | null;
  year_of_study: string | null;
  area_type: string | null;
  disability: boolean;
  farmer: boolean;
  employment_status: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SchemeField {
  key: string;
  label: string;
  type: "text" | "number" | "file";
  required?: boolean;
}

export interface Scheme {
  id: string;
  scheme_name: string;
  description: string;
  state: string;
  category: string;
  benefit: string;
  age_min: number | null;
  age_max: number | null;
  income_max: number | null;
  education_requirement: string[];
  student_required: boolean;
  gender_requirement: string | null;
  category_requirement: string[];
  rural_required: boolean;
  disability_required: boolean;
  farmer_required: boolean;
  application_deadline: string | null;
  official_url: string | null;
  required_documents: string[];
  scheme_specific_fields: SchemeField[];
  is_demo: boolean;
  created_at: string;
}

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
  matched: string[];
}

export const STATES = [
  "All India",
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export const EDUCATION_LEVELS = [
  "Below Class 10",
  "Class 10",
  "Class 12",
  "Diploma",
  "Undergraduate",
  "Postgraduate",
  "Doctorate",
];

export const SOCIAL_CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"];
export const GENDERS = ["Female", "Male", "Other"];
export const OCCUPATION_TYPES = ["Student", "Working", "Other"];
export const AREA_TYPES = ["Rural", "Urban"];
export const EMPLOYMENT_STATUSES = [
  "Not employed",
  "Unemployed",
  "Salaried",
  "Self employed",
  "Daily wage",
  "Retired",
];
export const SCHEME_CATEGORIES = [
  "Education",
  "Employment",
  "Agriculture",
  "Women Empowerment",
  "Disability Welfare",
  "Skill Development",
  "Social Welfare",
  "Health",
  "General",
];

export function calculateAge(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function formatINR(value: number | null | undefined): string {
  if (value === null || value === undefined) return "Not provided";
  return "₹" + new Intl.NumberFormat("en-IN").format(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "No deadline";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "No deadline";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function isExpired(scheme: Scheme): boolean {
  if (!scheme.application_deadline) return false;
  const d = new Date(scheme.application_deadline);
  d.setHours(23, 59, 59, 999);
  return d.getTime() < Date.now();
}

/**
 * Core eligibility engine. Compares a saved citizen profile with a scheme's
 * criteria and returns whether the person appears eligible, plus the exact
 * reasons they do not qualify.
 */
export function checkEligibility(profile: Profile | null, scheme: Scheme): EligibilityResult {
  const reasons: string[] = [];
  const matched: string[] = [];

  if (!profile) {
    return { eligible: false, reasons: ["Create your profile to check eligibility."], matched };
  }

  const age = calculateAge(profile.date_of_birth);
  if (age === null) {
    reasons.push("Date of birth is missing in your profile.");
  } else {
    if (scheme.age_min !== null && age < scheme.age_min) {
      reasons.push(`Minimum age for this scheme is ${scheme.age_min} years.`);
    } else if (scheme.age_max !== null && age > scheme.age_max) {
      reasons.push(`Maximum age for this scheme is ${scheme.age_max} years.`);
    } else if (scheme.age_min !== null || scheme.age_max !== null) {
      matched.push(`Age ${age} is within the allowed range.`);
    }
  }

  if (scheme.state && scheme.state !== "All India") {
    if (profile.state !== scheme.state) {
      reasons.push(`This scheme is only for residents of ${scheme.state}.`);
    } else {
      matched.push(`You live in ${scheme.state}.`);
    }
  } else {
    matched.push("Open to all states.");
  }

  if (scheme.income_max !== null) {
    if (profile.annual_income === null || profile.annual_income === undefined) {
      reasons.push("Annual family income is missing in your profile.");
    } else if (profile.annual_income > scheme.income_max) {
      reasons.push(`Family income must be ${formatINR(scheme.income_max)} or less.`);
    } else {
      matched.push(`Family income is within ${formatINR(scheme.income_max)}.`);
    }
  }

  if (scheme.education_requirement.length > 0) {
    if (!profile.education_level || !scheme.education_requirement.includes(profile.education_level)) {
      reasons.push(`Education level required: ${scheme.education_requirement.join(", ")}.`);
    } else {
      matched.push(`Your education level (${profile.education_level}) qualifies.`);
    }
  }

  if (scheme.student_required) {
    if (profile.occupation_type !== "Student") {
      reasons.push("Only current students can apply for this scheme.");
    } else {
      matched.push("You are a current student.");
    }
  }

  if (scheme.gender_requirement && scheme.gender_requirement !== "Any") {
    if (profile.gender !== scheme.gender_requirement) {
      reasons.push(`This scheme is only for applicants of gender: ${scheme.gender_requirement}.`);
    } else {
      matched.push(`Gender requirement (${scheme.gender_requirement}) is met.`);
    }
  }

  if (scheme.category_requirement.length > 0) {
    if (!profile.social_category || !scheme.category_requirement.includes(profile.social_category)) {
      reasons.push(`Social category required: ${scheme.category_requirement.join(", ")}.`);
    } else {
      matched.push(`Social category (${profile.social_category}) qualifies.`);
    }
  }

  if (scheme.rural_required) {
    if (profile.area_type !== "Rural") {
      reasons.push("This scheme is only for applicants living in rural areas.");
    } else {
      matched.push("You live in a rural area.");
    }
  }

  if (scheme.disability_required) {
    if (!profile.disability) {
      reasons.push("This scheme is only for persons with a disability certificate.");
    } else {
      matched.push("Disability requirement is met.");
    }
  }

  if (scheme.farmer_required) {
    if (!profile.farmer) {
      reasons.push("This scheme is only for farmer families.");
    } else {
      matched.push("Farmer requirement is met.");
    }
  }

  return { eligible: reasons.length === 0, reasons, matched };
}

const PROFILE_FIELDS: (keyof Profile)[] = [
  "full_name",
  "date_of_birth",
  "gender",
  "state",
  "district",
  "annual_income",
  "social_category",
  "occupation_type",
  "education_level",
  "area_type",
  "employment_status",
];

export function profileCompletion(profile: Profile | null): number {
  if (!profile) return 0;
  const filled = PROFILE_FIELDS.filter((f) => {
    const v = profile[f];
    return v !== null && v !== undefined && v !== "";
  }).length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
}

export function generateApplicationRef(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `YS-${year}-${random}`;
}
