# Update Workflow

Follow this strict workflow when pushing updates to the live production environment to prevent outages and regressions.

## 1. Development & Verification
1. Make your changes locally on your development environment.
2. Run `npm run build` to ensure the application compiles cleanly without Next.js or TypeScript errors.
3. Test the affected features manually using the local development server.

## 2. Version Control
4. Check the `git diff` to ensure no accidental debug logs, secrets, or unrelated changes are included.
5. Commit with a clear and descriptive message that notes the phase or feature name (e.g., `git commit -m "Phase 8.9C - Security audit and deployment docs"`).
6. Push to the GitHub repository.

## 3. Staging & Deployment
7. Test the Vercel Preview Deployment to ensure cloud environments build and run correctly.
8. Deploy to Production **only after** the preview deployment passes all manual checks.

## 4. Rollback Strategy
If a production deployment breaks:
- **Use Vercel Rollback**: Navigate to the Vercel dashboard and instantly rollback to the previous stable deployment.
- **Git Revert**: Revert the last Git commit locally and push if the codebase needs fixing immediately.
- **Do not panic-edit production**: Never edit production files live. Fix locally, build, and push.
- **Database Issues**: For DB breakages, create corrective SQL migrations instead of manually mutating tables.
