# Pre-Deploy Tests

Before any major deployment to production, perform the following manual tests to ensure all core workflows function smoothly.

## Auth
- [ ] Signup flow works successfully.
- [ ] Login flow works successfully.
- [ ] Logout works successfully.

## Notes
- [ ] Upload PDF flow works and correctly stores the document in Supabase Storage.
- [ ] Browse approved notes lists the notes appropriately.
- [ ] Open note details page renders all required metadata and UI.
- [ ] Download and view PDF functionality works correctly.

## Study Copilot
- [ ] **Smart Summary**: Generates successfully and saves.
- [ ] **Practice Quiz (MCQ)**: Generates successfully and saves.
- [ ] **Flashcards**: Generates successfully and saves.
- [ ] **Important Questions**: Generates successfully and saves.
- [ ] **Ask Doubt**: Generates successfully and saves.
- [ ] **Saved Results**: Can view and open previously generated results.
- [ ] **Reader**: Displays saved results correctly.
- [ ] **Exam Sprint**: Missing steps are generated successfully when initiated.
- [ ] **Multi-PDF Study Pack**: Combines selected PDFs and generates successfully.
- [ ] **Scanned PDF Behavior**: Falls back to document reading appropriately when text extraction is impossible.

## Premium
- [ ] **Free Limit**: Enforces standard generation limits correctly.
- [ ] **Premium Limit**: Enforces premium generation limits correctly.
- [ ] **Expired Premium Fallback**: Properly restricts users whose premium has expired.
- [ ] **Pricing Page**: Renders limits and upgrade options accurately.

## Admin
- [ ] Approve / reject pending notes in the admin dashboard.
- [ ] Verify that a normal user cannot access admin routes (e.g. `/dashboard/admin`).

## Security & Deployment
- [ ] Verify no `.env.local` is staged in Git.
- [ ] Verify no frontend secrets are exposed (no `NEXT_PUBLIC` for private keys).
- [ ] Verify `npm run build` passes locally with zero errors.
