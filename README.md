<div align="center">
  <h1>NotePilot</h1>
  <p><strong>AI-powered college notes and study copilot platform</strong></p>
  <p>🚀 <strong>Live Demo:</strong> <a href="https://notepilot-flame.vercel.app">https://notepilot-flame.vercel.app</a></p>
  <p><em>Prototype payment runs in Razorpay Test Mode, no real money charged.</em></p>

  <!-- Badges -->
  <img src="https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Clerk-6C47FF?style=flat&logo=clerk&logoColor=white" alt="Clerk Auth" />
  <img src="https://img.shields.io/badge/Gemini_AI-4285F4?style=flat&logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Razorpay-Test_Mode-blue?style=flat&logo=razorpay" alt="Razorpay Test Mode" />
  <img src="https://img.shields.io/badge/Vercel-Deployment-black?style=flat&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/License-All_Rights_Reserved-red?style=flat" alt="License" />
</div>

<hr />

## Overview
NotePilot is a modern, AI-powered study companion designed to help students organize their notes, generate deep insights, and accelerate learning. Built with a powerful technology stack, it provides a seamless experience for uploading course materials and interrogating them using an intelligent Gemini-powered Study Copilot. NotePilot is built for speed, safety, and productivity.

## Features

| Area | Description |
|---|---|
| **Notes Platform** | Easily upload, organize, and access all your study materials and notes in one place. |
| **AI Study Copilot** | Generate summaries, ask questions, and create dynamic study plans instantly using Gemini. |
| **Premium System** | Tiered access system unlocking unlimited AI generations and advanced platform features. |
| **Admin & Safety** | Fully secured backend with Row Level Security (RLS) and strict API route validations. |
| **User Experience** | Clean, fast, and responsive interface designed specifically for students. |

## Screenshots

<div align="center">
  <img src="/public/screenshots/landing.png" alt="Landing Page" width="45%" onerror="this.onerror=null; this.src='https://placehold.co/600x400/png?text=Landing+Page\n(Screenshot+coming+soon)';"/>
  <img src="/public/screenshots/dashboard.png" alt="Dashboard" width="45%" onerror="this.onerror=null; this.src='https://placehold.co/600x400/png?text=Dashboard\n(Screenshot+coming+soon)';"/>
  <br/>
  <img src="/public/screenshots/study-copilot.png" alt="Study Copilot" width="45%" onerror="this.onerror=null; this.src='https://placehold.co/600x400/png?text=Study+Copilot\n(Screenshot+coming+soon)';"/>
  <img src="/public/screenshots/pricing.png" alt="Pricing" width="45%" onerror="this.onerror=null; this.src='https://placehold.co/600x400/png?text=Pricing\n(Screenshot+coming+soon)';"/>
</div>

## Architecture Overview

```text
User 
  → Next.js App Router 
    → Clerk Auth 
      → Supabase Database/Storage 
        → Gemini AI 
          → Razorpay Test Payments 
            → Vercel Production
```

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (App Router), React, Tailwind CSS |
| **Backend** | Next.js API Routes |
| **Auth** | Clerk |
| **Database** | Supabase (PostgreSQL) |
| **Storage** | Supabase Storage |
| **AI** | Google Gemini API |
| **Payments** | Razorpay |
| **Deployment** | Vercel |

## Local Setup

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Set up your environment variables. Copy `.env.example` to `.env.local` and fill in the required keys.
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build the project for production:
   ```bash
   npm run build
   ```

## Environment Variables

See `.env.example` for the required keys. Never include real secrets in `.env.example`.

## Security

NotePilot strictly follows secure development practices:
- **No service role key on client:** The `SUPABASE_SERVICE_ROLE_KEY` is completely isolated to server contexts.
- **No Gemini key on client:** AI logic operates securely via protected backend routes.
- **No Razorpay secret on client:** Webhooks and verifications strictly occur on the backend.
- **Protected server routes:** All critical operations require valid authentication.
- **Supabase RLS:** Row Level Security is active to prevent unauthorized data access.

## Release Status

- **v1.0.0 — Production Foundation**
- **v1.1.0 — Prototype Payments**
- **v1.2.0 — Mobile Experience Polish** *(Upcoming/In Progress)*

## Roadmap

- Mobile-first responsive polish
- Better study analytics
- More AI study modes
- Note quality scoring
- Real payment live mode after prototype validation

## Author

Maintained by **Raj Dwivedi**.
