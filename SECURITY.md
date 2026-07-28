# Security Policy

## Supported Versions
Only the latest main branch is actively supported.

## Reporting a Vulnerability
Please report issues privately to the author. Do not open public issues for security vulnerabilities.

## Critical Rules
- **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY`. It bypasses all database security policies.
- **NEVER** expose your `GEMINI_API_KEY`.
- **NEVER** expose your `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET`.
- Prototype payment uses Razorpay Test Mode.
