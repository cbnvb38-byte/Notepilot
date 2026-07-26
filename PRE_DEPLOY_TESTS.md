# Pre-Deploy Tests

Before pushing code to production, perform the following manual testing checklist. This ensures core features are intact and functional.

## Core Workflows
- [ ] **Auth**: Sign out, sign back in (using Clerk). Verify redirection to `/dashboard`.
- [ ] **Dashboard**: Verify stats load, recent notes are visible, and Study Copilot shortcuts work.
- [ ] **Notes Browser**: Check that sorting/filtering works, and note cards render the correct 4-button layout (Preview, Study, Download, Save).
- [ ] **Upload**: Complete a full note upload flow. Verify it appears in "Pending" status in the admin panel, or your uploaded list.
- [ ] **Note Details**: Open a note detail page. Ensure the PDF previews correctly and the Copilot sidebar is functional.

## Study Copilot & AI Features
- [ ] **Saved Results**: Open an existing AI generation from the dashboard history. Verify it does *not* increment usage counters.
- [ ] **Multi-PDF Study Pack**: Start a Multi-PDF generation with multiple files. Verify the markdown renders properly.
- [ ] **Exam Sprint**: Test the 4-step guided revision workflow from the `/sprint` route.
- [ ] **Single Note Generation**: Generate a Smart Summary for a single note. Verify the loading state and success formatting.
- [ ] **Error Handling**: Temporarily disconnect the internet or mock an API failure. Verify the UI handles it gracefully without crashing.

## Operations & Admin
- [ ] **Admin Panel**: Visit `/dashboard/admin`. Ensure the "Pending", "Approved", and "Rejected" tabs filter correctly. Verify the Approve/Reject buttons function. (Must be logged in as an admin).
- [ ] **Notifications**: Check the notification bell. Ensure marking notifications as read works.

## Polish & Responsiveness
- [ ] **Mobile Layout**: Open DevTools, switch to a mobile viewport (e.g., iPhone 14 Pro). Ensure there is NO horizontal overflow and the navigation fits correctly.
- [ ] **Modals**: Ensure all pop-ups (Reject Dialog, Delete Dialog) fit on the screen without scrolling awkwardly.
- [ ] **Pricing**: Visit the Pricing page and ensure the Godmode UI tier cards display correctly.
