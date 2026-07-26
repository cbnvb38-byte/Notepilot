# Update Workflow

This document outlines the standard workflow for safely updating the College Notes application without breaking the production environment.

## 1. Create a Branch or Backup
Never push directly to the `main` branch.
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

## 2. Make Changes
- Implement your UI or logic changes.
- Ensure you are running the local development server (`npm run dev`) to catch immediate errors.
- Do NOT expose any new secrets via `NEXT_PUBLIC_` unless they are explicitly meant for the client browser.

## 3. Run Build
Before committing any changes, verify that the production build succeeds locally:
```bash
npm run build
```
If there are any TypeScript or Turbopack errors, fix them before proceeding.

## 4. Test Important Routes
Verify the following critical paths locally:
- Dashboard (`/dashboard`)
- Notes Browser (`/dashboard/browse`)
- Upload Note (`/dashboard/upload`)
- Note Details Page (`/notes/[id]`)
- Study Copilot (`/dashboard/study-copilot` and generated results)

## 5. Commit and Push
```bash
git add .
git commit -m "Brief description of changes"
git push origin feature/your-feature-name
```

## 6. Check Vercel Preview
- Open a Pull Request on GitHub.
- Vercel will automatically generate a Preview Deployment.
- Review the Preview URL to ensure everything works in a production-like environment.

## 7. Deploy to Production
- Merge the Pull Request into `main`.
- Vercel will trigger a production deployment.
- Verify the live site.

## 8. Rollback Plan
If the deployment breaks production:
1. Go to the Vercel Dashboard for the project.
2. Navigate to the **Deployments** tab.
3. Find the last stable deployment.
4. Click the three dots (...) and select **Promote to Production** (or **Rollback**).
5. Revert the bad commit on the `main` branch locally and push to fix the repository state.
