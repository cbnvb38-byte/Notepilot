# Production Test Checklist

Execute this checklist immediately after successfully deploying to Vercel production.

## 1. Landing & Navigation
- [ ] Open the live landing page URL.
- [ ] Verify the hero image (`notepilot-hero.png`) and creator signature load correctly.
- [ ] Verify public routes (`/`, `/pricing`, `/browse` if available) load without crashing.

## 2. Authentication
- [ ] Click "Sign Up" and complete registration.
- [ ] Log out.
- [ ] Click "Sign In" and authenticate with the newly created account.
- [ ] Verify you are redirected to the `/dashboard`.

## 3. Core App Flow
- [ ] Navigate to **Browse Notes**.
- [ ] Navigate to **Upload** and upload a test PDF.
- [ ] (If note is pending) Log in with an admin account or set the note status to `approved` in Supabase manually.
- [ ] Open the Note Details page for the approved note.
- [ ] Verify the note renders without error.

## 4. Study Copilot & AI
- [ ] Click **Smart Summary** and verify generation succeeds.
- [ ] Click **Ask Doubt**, enter a question, and verify the answer succeeds.
- [ ] Go to **Saved Results** in Study Copilot and verify the newly generated summary exists.
- [ ] Open the saved summary in the **Reader** and verify the Markdown formats correctly.
- [ ] Click **Exam Sprint** and trigger generation for a missing step. Verify success.
- [ ] Select 2 test PDFs and run **Multi-PDF Study Pack**. Verify it successfully combines content.
- [ ] Upload a blurry/scanned PDF and verify **Scanned PDF Behavior** falls back to document reading seamlessly.

## 5. Billing & Premium Limits
- [ ] Test the **Free/Premium limit check**: Try generating AI content until you hit the free tier quota. Ensure the block UI appears.
- [ ] Navigate to the **Pricing** page. Verify all limits and upgrade options display accurately.

## 6. Layout & Responsiveness
- [ ] Resize the browser to mobile width.
- [ ] Verify the sidebar collapses and the mobile drawer opens properly.
- [ ] Verify buttons and generated text blocks are readable on mobile.

## 7. Session Resiliency
- [ ] Log out of the account.
- [ ] Verify you cannot access `/dashboard/study-copilot` unauthenticated.
- [ ] Log back in to ensure session state restores smoothly.
