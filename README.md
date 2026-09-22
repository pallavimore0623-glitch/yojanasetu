# YojanaSetu

Build a complete responsive web application called "YojanaSetu".

Tagline:

"One Profile. All Eligible Schemes."

PURPOSE:

YojanaSetu is an intelligent government scheme discovery and eligibility notification platform for Indian citizens.

The core idea is:

1. User creates a profile only once.

2. The system stores common personal and educational information.

3. Government schemes are stored in a structured database.

4. The eligibility engine compares the user's profile with scheme eligibility criteria.

5. When a new scheme is added, the system automatically checks existing users.

6. Eligible users receive a notification.

7. Users can open the scheme and click Apply Now.

8. The application form should automatically pre-fill information already available in the user's profile.

9. Only scheme-specific new information should be requested.

10. Before final submission, show a review page and obtain user consent.

IMPORTANT:

This is a prototype/demo. Do NOT claim live integration with Indian government portals. Use sample/verified public scheme information and clearly label the application flow as a prototype.

TECHNOLOGY:

- React

- TypeScript

- Tailwind CSS

- Supabase for authentication and database

- Responsive design

- Clean component architecture

DESIGN:

Create a modern, trustworthy Indian public-service style interface.

Use a professional blue/white visual theme.

Make it mobile responsive.

Use cards, badges, icons, clear typography and accessible buttons.

Do not make the interface look like a generic e-commerce website.

PAGES:

1. LANDING PAGE

- Logo: YojanaSetu

- Tagline

- Short explanation

- "Find My Schemes" CTA

- "How It Works" section

- 4 steps:

  Create Profile → Check Eligibility → Get Notification → Apply Easily

- Benefits:

  Personalized

  Time-saving

  One-time profile

  Eligibility alerts

- Disclaimer:

  "This prototype is for demonstration. Always verify scheme details on the official government portal before applying."

2. AUTHENTICATION

Create:

- Sign Up

- Login

- Logout

Use Supabase authentication.

3. USER PROFILE

Create a profile form with:

- Full Name

- Date of Birth

- Gender

- State

- District

- Annual Family Income

- Social Category

- Student/Working/Other

- Education Level

- Course

- College/Institution

- Year of Study

- Rural/Urban

- Disability status

- Farmer status

- Employment status

Allow the user to edit/update their profile.

IMPORTANT:

Do not collect unnecessary sensitive information.

Do not store bank account numbers, Aadhaar numbers, passwords or other highly sensitive information in this prototype.

4. USER DASHBOARD

Show:

- Welcome message

- Profile completion percentage

- Number of eligible schemes

- New notifications

- Recommended schemes

- Application status

- "Check Eligibility Again" button

Create cards:

"Eligible for You"

"Newly Added"

"Application Progress"

5. SCHEME DATABASE

Create a scheme database with fields:

- id

- scheme_name

- description

- state

- category

- benefit

- age_min

- age_max

- income_max

- education_requirement

- student_required

- gender_requirement

- category_requirement

- rural_required

- disability_required

- application_deadline

- official_url

- required_documents

- scheme_specific_fields

- created_at

Create at least 10 realistic DEMO schemes with clearly marked demo/sample status if exact current official details are not verified.

6. ELIGIBILITY ENGINE

Create a reusable eligibility function.

Rules should check:

- Age

- State

- Income

- Education

- Student status

- Gender

- Social category

- Rural/Urban

- Disability status

- Other scheme-specific requirements

Return:

eligible = true/false

and a list of missing requirements/reasons.

Do not expose private eligibility data publicly.

7. ELIGIBLE SCHEMES PAGE

Show only schemes for which the logged-in user appears eligible.

Each card should show:

- Scheme name

- Benefit

- Deadline

- Eligibility badge

- Required documents

- "View Details"

- "Apply Now"

8. NOTIFICATION SYSTEM

Create a notification table.

When a new scheme is added:

- compare the scheme against user profile

- if eligible, create a notification for that user

Notification example:

"🔔 New Scheme Match"

"You appear eligible for XYZ Scheme."

"Benefit: ..."

"Deadline: ..."

"View Scheme"

Do NOT create a notification if the user does not match the eligibility criteria.

Show unread/read status.

9. NEW SCHEME DEMO

Create an ADMIN/DEMO page where an authorized demo user can add a new scheme.

Fields:

- Scheme name

- Description

- Eligibility criteria

- Benefit

- Deadline

- Required documents

- Official URL

When the admin adds the scheme:

automatically run eligibility matching against demo users.

For eligible users:

create notification.

For non-eligible users:

do not create notification.

10. SCHEME DETAILS PAGE

Show:

- Scheme name

- Description

- Benefits

- Eligibility

- Documents required

- Deadline

- Application steps

- Official website link

- "Apply Now"

Add:

"Eligibility result based on your saved profile."

11. SMART APPLICATION FORM

This is the most important feature.

When user clicks "Apply Now":

load their saved profile.

Automatically pre-fill:

- Name

- Date of Birth

- Gender

- State

- District

- Education

- College

- Course

- Year of study

- Income

- Category

- Other profile fields

Clearly label these:

"Auto-filled from your profile"

Then show scheme-specific fields separately:

"Additional Information Required"

Example:

- Bank-related information placeholder

- Document upload placeholder

- Scheme-specific question

- Certificate number placeholder

Do NOT request Aadhaar or real bank details in this prototype.

Allow document upload as a prototype placeholder.

12. APPLICATION REVIEW PAGE

Before submission show:

"Review Your Application"

Sections:

Profile Information

Auto-filled Information

Additional Information

Documents

Show:

"Your saved profile information has been reused to reduce repetitive data entry."

Add checkbox:

"I confirm that the information provided is accurate and I consent to using my profile information for this application."

Then:

"Submit Application"

13. APPLICATION SUCCESS PAGE

Show:

✓ Application submitted successfully

Application ID:

Generate a demo application ID.

Show:

- Scheme name

- Submission date

- Status: Submitted

- Note:

"This is a prototype submission. Complete the official application through the government portal when required."

14. APPLICATION TRACKING

Create page:

"My Applications"

Columns/cards:

- Scheme

- Application ID

- Date

- Status

- View

Statuses:

Draft

Ready for Review

Submitted

Under Review

Approved

Rejected

Use demo data where required.

15. SEARCH AND FILTER

Allow users to search schemes by:

- Scheme name

- State

- Education

- Category

- Student

- Benefit

Also provide:

"Only show schemes I'm eligible for."

16. ADMIN/DEMO MODE

Create a protected demo admin page.

Admin can:

- Add scheme

- Edit scheme

- View scheme

- Trigger eligibility matching

- View generated notifications

17. DATABASE TABLES

Create Supabase tables:

profiles

schemes

notifications

applications

application_documents

admin_users

Use proper foreign keys.

18. SECURITY

Implement:

- Authentication

- Row Level Security

- Users can access only their own profile

- Users can access only their own notifications

- Users can access only their own applications

- Admin functionality should be protected

Do not expose sensitive personal data.

19. DEMO DATA

Create enough sample data so the entire workflow can be demonstrated.

Create at least:

- 5 demo users with different profiles

- 10 demo schemes

- Different eligibility criteria

Make sure some users are eligible and some are not.

20. DEMO SCENARIO

The application must support this exact demonstration:

Demo User:

Age: 19

State: Maharashtra

Student: Yes

Education: Undergraduate

Annual Family Income: ₹2,00,000

Then add a new demo scheme:

Name: "Student Technology Support Scheme"

Eligibility:

Age 18-25

Maharashtra

Student = Yes

Undergraduate

Income <= ₹3,00,000

After adding it:

the demo user should receive:

"🔔 You appear eligible for a new scheme."

A different demo user who does not satisfy the criteria should NOT receive the notification.

Then click Apply Now.

Show profile information automatically filled.

Add one new scheme-specific question.

Then Review → Consent → Submit → Application ID.

21. DASHBOARD STATISTICS

Show:

Eligible Schemes

New Notifications

Applications

Profile Completion

Use attractive cards.

22. ERROR HANDLING

Handle:

- Missing profile

- Incomplete profile

- No matching schemes

- Expired scheme

- Invalid form

- Unauthorized admin access

23. EMPTY STATES

Example:

"No new eligible schemes found."

"Complete your profile to improve matching."

24. IMPORTANT UI TEXT

Use simple English.

Keep all important information understandable to college students and ordinary citizens.

25. FINAL QUALITY

Make the application look like a polished college innovation/research prototype, not a basic CRUD project.

Ensure:

- no broken buttons

- no dead links inside the application

- all navigation works

- forms validate

- demo data works

- eligibility matching works

- notifications work

- autofill works

- review and consent works

- application submission works

- responsive on mobile and desktop

Add a small footer:

"YojanaSetu — Prototype for academic demonstration."

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7f7652f6-4d0f-491c-b629-9f028ac78fbc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
