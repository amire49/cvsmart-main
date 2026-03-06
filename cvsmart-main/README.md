How to run it on your own machine

First Clone the repository:

Then Install frontend dependencies:

- cd frontend
- npm install

Run the development server:

- npm run dev

Then Setup the Backend

Create a virtual environment:

- cd backend

python -m venv venv

- For Linux run: source venv/bin/activate # On Windows: venv\Scripts\activate

Install dependencies:

- pip install -r requirements.txt

After that Create a .env file in the backend directory:

- GOOGLE_API_KEY=your_gemini_api_key_here
  ( you can get a free gemini api key from https://aistudio.google.com/ )

Finally Start the Flask server:

- python app.py
