# AI Pipeline

NotePilot uses the **Gemini API** for study assistance.
- Client requests are routed to internal Next.js API endpoints.
- API endpoints securely append the `GEMINI_API_KEY` and call the Gemini models.
- Results are streamed or returned to the client and stored in Supabase if necessary.
