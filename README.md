# NotePilot: Your AI Study Copilot

🚀 **Live Production Link:** [https://notepilot-flame.vercel.app](https://notepilot-flame.vercel.app)

NotePilot is an AI-powered study companion that helps you organize notes, generate insights, and accelerate your learning using advanced Gemini AI.

## Key Features
- **Smart Note Management:** Easily organize and access your study materials.
- **AI Study Copilot:** Generate summaries, ask questions, and create study plans instantly.
- **Premium Tier:** Unlock unlimited AI generations and advanced features.

## Note on Premium/Razorpay (Test Mode)
The platform currently uses Razorpay in **Test Mode** for prototype purposes. You can test the premium checkout flow without real money.

## Tech Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase (PostgreSQL)
- **Authentication:** Clerk
- **AI Engine:** Google Gemini API
- **Payments:** Razorpay

## Screenshots
![Dashboard Placeholder](/public/screenshots/dashboard-placeholder.png)
*(Screenshots coming soon)*

## Local Setup
1. Clone the repository.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your secrets.
4. Run the development server: `npm run dev`

## Environment Variables
See `.env.example` for the required keys. Never commit your `.env.local` file!

## Database Setup (Supabase)
Run the SQL migrations located in the `supabase/migrations/` folder on your Supabase project to create the required tables and Row Level Security (RLS) policies. See `docs/SUPABASE_SETUP.md` for details.

## Deployment
This project is configured for seamless deployment on Vercel. Ensure all environment variables (including `SUPABASE_SERVICE_ROLE_KEY`) are correctly set in the Vercel dashboard. See `docs/DEPLOYMENT.md`.

## Security Notes
Please review [SECURITY.md](SECURITY.md) for critical safety guidelines, including protecting API keys and service roles.

## Roadmap
- Integrate more AI models
- Collaborative study groups
- Mobile app version

## Author
Developed and maintained by **Raj Dwivedi**.
