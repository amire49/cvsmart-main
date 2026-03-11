## How to run it locally

- **Clone the repository**.
- **Install frontend dependencies**:
  - `cd frontend`
  - `npm install`
- **Run the frontend dev server**:
  - `npm run dev`

Then set up the backend:

- `cd backend`
- Create and activate a virtual environment:
  - `python -m venv venv`
  - Linux/macOS: `source venv/bin/activate`
  - Windows (PowerShell): `.\venv\Scripts\Activate.ps1`
- Install dependencies:
  - `pip install -r requirements.txt`
- Copy `.env.example` to `.env` and fill in the values:
  - `GOOGLE_API_KEY` – Gemini API key (from `https://aistudio.google.com`)
  - `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` – for job recommendations (optional but recommended)
  - `RAPIDAPI_KEY` – for JSearch (optional)
  - `ALLOWED_ORIGINS` – comma-separated list of allowed frontend origins for CORS (e.g. `http://localhost:3000,https://yourdomain.com`)
  - `RATELIMIT_STORAGE_URL` – optional Flask-Limiter storage backend (e.g. `redis://localhost:6379/0`)
- Start the Flask server for local development:
  - `python app.py`

In production, run the Flask app behind a proper WSGI server (gunicorn/uvicorn) with debug disabled, and configure all secrets via environment variables instead of committed files.
