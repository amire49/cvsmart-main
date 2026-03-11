## Frontend overview

This is the Next.js frontend for the CVSmart application. It provides:

- A resume **analyzer** page with AI-powered scoring, strengths/gaps, job recommendations, and interview prep.
- A **CV builder** page with live preview templates and DOCX export.

The frontend talks to the Flask backend via `NEXT_PUBLIC_API_URL`.

## Getting started (development)

1. Install dependencies:

```bash
npm install
```

2. Ensure the backend is running locally on `http://127.0.0.1:5000` (see root `README.md`).

3. Start the dev server:

```bash
npm run dev
```

4. Open `http://localhost:3000` in your browser.

## Required environment variables

Create a `.env.local` file in the `frontend` directory and set:

- `NEXT_PUBLIC_API_URL` – base URL of the Flask API (e.g. `http://127.0.0.1:5000` in dev, your API domain in production).

No API keys are exposed from the frontend; all secrets live on the backend.

## Notes & limitations

- Improved CV export is currently **DOCX only**. PDF/template selection is intentionally disabled for this version.
- Some Supabase-authenticated profile APIs exist in `src/services/api.ts` but corresponding backend routes are not implemented yet.

For deployment, configure `NEXT_PUBLIC_API_URL` to point at your deployed backend, and build as usual with:

```bash
npm run build
```
