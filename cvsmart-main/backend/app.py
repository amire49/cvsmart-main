from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging
import pdfplumber
from docx import Document
import google.generativeai as genai
import os
import re
import io
import json
import requests
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from docx import Document as DocxDocument
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize rate limiter
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,  # renamed argument
    default_limits=["100 per hour"]
)
limiter.init_app(app)

# Configure logging
logging.basicConfig(level=logging.INFO)

# Configure Gemini API using environment variable
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("No GOOGLE_API_KEY found in environment variables")
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel(
    model_name='gemini-2.5-flash',
    system_instruction="""You are a highly experienced senior recruiter and career coach with over 25 years of experience, specializing in the tech industry. Your task is to provide a comprehensive analysis comparing the provided resume against the given job description.

**Output Format:** Structure your response EXACTLY as follows:

1.  Overall Match Score: 🎯  Calculate a percentage score between 0-100% based on:
   - Skills match: Count matched skills vs required skills
   - Experience relevance: Evaluate how closely experience aligns with job requirements
   - Education/qualifications match: Compare required vs present qualifications
   - Project relevance: Assess if projects demonstrate required capabilities
   
   The final score should reflect a genuine assessment - use the full range from 20-95% depending on the actual match quality.
2.  Score Summary: 📊  Very Briefly (2-3 bullet points max) highlighting the *absolute key factor(s)* determining the score (e.g., "Strong experience in cloud technologies, but lacks specific project management experience.").
3.  General Match Assessment: 🔍 A brief narrative (2-3 sentences) summarizing how well the candidate's profile aligns with the role requirements.
4.  Key Highlights & Gaps:
     Key Skills Match:
           ✅ Top Matched Skills: List specific skills/technologies from the resume that directly match critical requirements in the job description.
           ⚠️ Partial Matches: Identify skills present in the resume that are relevant but could be emphasized more or lack specific context mentioned in the job description.
           ❌ Critical Missing Skills: List the *most critical* skills required by the job description that appear to be missing or not written in the resume.
     Experience Relevance:
              🌟 High-Impact Experience: Point out specific job experiences, projects, or accomplishments in the resume that strongly align with the responsibilities and goals outlined in the job description.
              🔍 Experience Gaps: Mention key areas of experience required by the job description that are not evident in the resume.
5.  Top Improvement Tips: 💡 Provide ONLY 3-5 specific, actionable recommendations that would have the HIGHEST IMPACT for this specific resume and job. Focus on the most critical gaps or areas for improvement. Do not list all possible improvements - prioritize based on:
   - How critical the gap is to the job requirements
   - How easily the candidate could address the issue
   - How much impact the change would have on their match score

      🛠️ Address Missing [Skill/Gaps]: Suggest how (e.g., "Highlight Python in Project X more" or "Add a section on cloud certifications").
      📊 Quantify Achievements: "Quantify your impact in Project X by adding metrics like 'reduced processing time by 15%' or 'managed a budget of $Y'."
      🔑 Incorporate Keywords: "Integrate keywords like 'cloud infrastructure management', 'CI/CD pipelines', and 'Agile methodologies' found in the job description into your relevant experience descriptions."
      ✏️ Refine Bullet Points: "Rephrase the bullet point about 'Developed software' under Job Z to highlight 'Developed scalable microservices using Python (Flask) and deployed on AWS ECS', aligning better with the JD's focus on microservices and cloud deployment."
      📁 Add Specific Projects: "Consider adding a brief section on Project A, emphasizing the use of [Specific Tech from JD], if applicable."
      🖋️ Formatting/Clarity: "Ensure consistent date formatting. Consider using the STAR method (Situation, Task, Action, Result) for key accomplishment bullet points."
      🎯 Tailor Summary/Objective: "Update summary with keywords 'X' and 'Y' from the Job Description."

**Tone:** Be professional, constructive, clear, actionable, and highly specific. Your goal is to empower the user to significantly improve their resume for this target role. Do not invent information not present in the resume or job description."""
    )

def extract_structured_from_analysis(text):
    """Parse the markdown analysis text to build structured dashboard data."""
    score = 50
    m = re.search(r'(\d{1,3})\s*%', text[:600])
    if m:
        score = min(100, max(0, int(m.group(1))))

    if score >= 75:
        verdict, verdict_color = "Strong Match", "#00e5a0"
    elif score >= 50:
        verdict, verdict_color = "Conditional Match", "#f4a261"
    else:
        verdict, verdict_color = "Weak Match", "#ff4d6d"

    def _extract_items(pattern, text, max_items=4):
        items = []
        for m in re.finditer(pattern, text):
            line = m.group(1).strip()
            line = re.sub(r'\*\*', '', line).strip()
            if len(line) > 10:
                items.append(line[:100])
            if len(items) >= max_items:
                break
        return items

    matched = _extract_items(r'✅\s*(.*)', text)
    partial = _extract_items(r'⚠️\s*(.*)', text)
    missing = _extract_items(r'❌\s*(.*)', text)
    high_impact = _extract_items(r'🌟\s*(.*)', text)
    exp_gaps = _extract_items(r'🔍\s*Experience\s*Gaps?[:\s]*(.*)', text)
    tips = _extract_items(r'(?:🛠️|📊|🔑|✏️|📁|🖋️|🎯)\s*(.*)', text, 6)

    tech_details = (matched + partial)[:4] or ["See full analysis"]
    tech_score = min(100, max(0, int(score * 1.15))) if matched else max(0, score - 10)

    exp_details = []
    exp_section = False
    for line in text.split('\n'):
        low = line.lower()
        if 'experience relevance' in low or 'experience gaps' in low:
            exp_section = True
            continue
        if exp_section:
            if line.strip() == '' or line.startswith('#'):
                exp_section = False
                continue
            cleaned = re.sub(r'[*#🌟🔍\-]', '', line).strip()
            if 10 < len(cleaned) < 120:
                exp_details.append(cleaned[:100])
    if not exp_details:
        for line in text.split('\n'):
            low = line.lower()
            if any(k in low for k in ['years of experience', 'experience gap', 'required:', 'professional experience']):
                cleaned = re.sub(r'[*#\-]', '', line).strip()
                if 10 < len(cleaned) < 120 and cleaned not in exp_details:
                    exp_details.append(cleaned[:100])
    exp_details = exp_details[:4] or ["See full analysis"]
    exp_score = max(0, score - 15) if missing else score

    proj_details = (high_impact[:4]) if high_impact else ["See full analysis"]
    proj_score = min(100, max(0, int(score * 1.05)))

    soft_details = []
    for kw in ['communication', 'remote', 'team', 'leader', 'mentor', 'self-directed', 'collaboration']:
        for line in text.split('\n'):
            if kw in line.lower() and len(line.strip()) > 10:
                cleaned = re.sub(r'[*#\-]', '', line).strip()[:100]
                if cleaned not in soft_details:
                    soft_details.append(cleaned)
                break
    soft_details = soft_details[:4] or ["See full analysis"]
    soft_score = max(0, min(100, score + 5))

    strengths = []
    for item in matched[:2] + high_impact[:1]:
        s = re.sub(r'[*]', '', item).strip()
        if s:
            strengths.append(s)
    if not strengths:
        strengths = ["See full analysis for strengths"]

    gaps = []
    for item in missing[:2] + exp_gaps[:1]:
        s = re.sub(r'[*]', '', item).strip()
        if s:
            gaps.append(s)
    if not gaps:
        gaps = ["See full analysis for gaps"]

    rec = ""
    m = re.search(r'General Match Assessment.*?\n\n(.*?)(?:\n\n|\nKey|\n\d)', text, re.DOTALL)
    if m:
        rec = re.sub(r'[*#🔍]', '', m.group(1)).strip()[:250]
    if not rec:
        m2 = re.search(r'🔍.*?General Match Assessment.*?\n+(.*?)(?:\n\n)', text, re.DOTALL)
        if m2:
            rec = re.sub(r'[*#🔍]', '', m2.group(1)).strip()[:250]
    if not rec:
        rec = f"Overall match score: {score}%. See the full analysis for detailed recommendations."

    return {
        "overallScore": score,
        "verdict": verdict,
        "verdictColor": verdict_color,
        "sections": [
            {"id": "technical", "label": "Technical Alignment", "score": tech_score, "color": "#00e5a0", "icon": "⚡", "details": tech_details},
            {"id": "experience", "label": "Experience Match", "score": exp_score, "color": "#ff4d6d", "icon": "📅", "details": exp_details},
            {"id": "projects", "label": "Project Relevance", "score": proj_score, "color": "#00b4d8", "icon": "🏗️", "details": proj_details},
            {"id": "softskills", "label": "Communication & Fit", "score": soft_score, "color": "#f4a261", "icon": "💬", "details": soft_details},
        ],
        "strengths": strengths[:3],
        "gaps": gaps[:3],
        "recommendation": rec,
    }

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text

def extract_text_from_docx(file_path):
    doc = Document(file_path)
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text

def extract_keywords_from_resume(resume_text, max_keywords=8):
    """Use Gemini to extract job-relevant keywords from resume text."""
    if not resume_text or len(resume_text.strip()) < 50:
        words = re.findall(r'[a-zA-Z]{3,}', resume_text[:500])
        return list(dict.fromkeys(words))[:max_keywords] if words else ["software", "developer"]
    try:
        prompt = f"""From this resume text, list exactly {max_keywords} job-relevant skills, technologies, or role keywords (e.g. Python, project management, AWS). One per line, no numbering. Only the keywords, nothing else."""
        response = model.generate_content(
            prompt + "\n\nResume:\n" + resume_text[:4000],
            generation_config=genai.GenerationConfig(temperature=0.1, max_output_tokens=200),
        )
        text = (response.text or "").strip()
        keywords = [line.strip() for line in text.split("\n") if line.strip() and len(line.strip()) < 50]
        keywords = keywords[:max_keywords]
        return keywords if keywords else ["software", "developer"]
    except Exception:
        words = re.findall(r'[a-zA-Z]{3,}', resume_text[:500])
        return list(dict.fromkeys(words))[:max_keywords] if words else ["software", "developer"]


def _parse_resume_heuristic(resume_text, job_description=""):
    """Best-effort parse of raw resume text into structured sections."""
    lines = (resume_text or "").strip().splitlines()
    name = ""
    email = ""
    phone = ""
    location = ""

    for line in lines[:15]:
        stripped = line.strip()
        if not stripped:
            continue
        if not name and len(stripped) < 60 and not re.search(r'[@\d]', stripped):
            name = stripped
            continue
        em = re.search(r'[\w.+-]+@[\w.-]+\.\w+', stripped)
        if em and not email:
            email = em.group(0)
        ph = re.search(r'\+?[\d\s\-().]{7,20}', stripped)
        if ph and not phone:
            phone = ph.group(0).strip()
        if any(kw in stripped.lower() for kw in ['addis', 'ababa', 'nairobi', 'new york', 'london', 'remote', 'ethiopia']):
            if not location:
                location = stripped

    section_map = {}
    current_section = "other"
    section_keywords = {
        "summary": ["summary", "professional summary", "profile", "objective", "about"],
        "experience": ["experience", "work experience", "employment", "work history"],
        "education": ["education", "academic", "qualification"],
        "skills": ["skills", "technical skills", "competencies", "technologies"],
        "projects": ["projects", "portfolio", "key projects"],
        "hobbies": ["hobbies", "interests", "activities"],
    }

    for line in lines:
        stripped = line.strip()
        low = stripped.lower().rstrip(':')
        matched_section = None
        for sec_key, keywords in section_keywords.items():
            if low in keywords or any(low == kw for kw in keywords):
                matched_section = sec_key
                break
        if matched_section:
            current_section = matched_section
            section_map.setdefault(current_section, [])
            continue
        if stripped:
            section_map.setdefault(current_section, []).append(stripped)

    skills_list = []
    for s_line in section_map.get("skills", []):
        for part in re.split(r'[,|;]', s_line):
            part = part.strip().strip('-').strip()
            if part and len(part) < 50:
                skills_list.append(part)

    experience_list = []
    exp_lines = section_map.get("experience", [])
    current_exp = None
    for el in exp_lines:
        if len(el) < 80 and not el.startswith('-') and not el.startswith('*'):
            if current_exp:
                experience_list.append(current_exp)
            current_exp = {"role": el, "company": "", "location": "", "dates": "", "bullets": []}
        elif current_exp:
            current_exp["bullets"].append(el.lstrip('-').lstrip('*').strip())
        else:
            current_exp = {"role": "", "company": "", "location": "", "dates": "", "bullets": [el.lstrip('-').lstrip('*').strip()]}
    if current_exp:
        experience_list.append(current_exp)

    education_list = []
    for ed_line in section_map.get("education", []):
        education_list.append({"degree": ed_line, "school": "", "year": ""})

    summary_text = " ".join(section_map.get("summary", []))[:500]
    if not summary_text:
        jd_title = (job_description or "").splitlines()[0].strip()[:100] if job_description else ""
        summary_text = f"Experienced professional applying for {jd_title}." if jd_title else ""

    projects_list = []
    for pl in section_map.get("projects", []):
        projects_list.append({"title": pl, "description": ""})

    hobbies = section_map.get("hobbies", [])

    return {
        "name": name,
        "title": "",
        "contact": {"email": email, "phone": phone, "location": location, "website": ""},
        "summary": summary_text,
        "skills": skills_list[:20],
        "experience": experience_list,
        "education": education_list,
        "projects": projects_list,
        "hobbies": hobbies,
    }


def generate_structured_cv_sections(resume_text, job_description, analysis_text=""):
    """Use Gemini to turn resume + job description into structured JSON CV sections."""
    prompt_parts = [
        "Resume text:\n", resume_text[:6000] or "",
        "\n\nJob description:\n", job_description[:4000] or "",
    ]
    if analysis_text:
        prompt_parts.append("\n\nFeedback to incorporate:\n")
        prompt_parts.append(analysis_text[:3000])
    prompt_parts.append(
        "\n\nReturn ONLY a valid JSON object with keys: name, title, contact, summary, "
        "skills, experience, education, projects, hobbies. No markdown fences."
    )
    full_prompt = "".join(prompt_parts)

    data = {}
    try:
        response = model_cv_json.generate_content(
            full_prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.15,
                max_output_tokens=4000,
            ),
        )
        text = (response.text or "").strip()
        if "```" in text:
            parts = re.split(r"```(?:\w*)\s*\n?", text, maxsplit=1)
            if len(parts) > 1:
                text = parts[1]
            text = re.sub(r"\s*```\s*$", "", text)
        text = text.strip()
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            text = text[start : end + 1]
        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            text_fixed = re.sub(r",\s*([}\]])", r"\1", text)
            try:
                data = json.loads(text_fixed)
            except json.JSONDecodeError:
                logging.warning("CV JSON parse failed; raw (first 400): %s", text[:400])
                data = {}
    except Exception as e:
        logging.exception("generate_structured_cv_sections Gemini error: %s", e)

    if not isinstance(data, dict) or not data or not data.get("name"):
        logging.info("Gemini JSON unusable, falling back to heuristic parsing")
        data = _parse_resume_heuristic(resume_text, job_description)

    def _s(value, default=""):
        return value if isinstance(value, str) else default

    def _l(value):
        return value if isinstance(value, list) else []

    contact = data.get("contact") or {}
    if not isinstance(contact, dict):
        contact = {}

    normalized = {
        "name": _s(data.get("name")),
        "title": _s(data.get("title")),
        "contact": {
            "email": _s(contact.get("email")),
            "phone": _s(contact.get("phone")),
            "location": _s(contact.get("location")),
            "website": _s(contact.get("website")),
        },
        "summary": _s(data.get("summary")),
        "skills": [str(s).strip() for s in _l(data.get("skills")) if str(s).strip()],
        "experience": [],
        "education": [],
        "projects": [],
        "hobbies": [str(h).strip() for h in _l(data.get("hobbies")) if str(h).strip()],
    }

    for exp in _l(data.get("experience")):
        if not isinstance(exp, dict):
            continue
        normalized["experience"].append({
            "role": _s(exp.get("role")),
            "company": _s(exp.get("company")),
            "location": _s(exp.get("location")),
            "dates": _s(exp.get("dates")),
            "bullets": [str(b).strip() for b in _l(exp.get("bullets")) if str(b).strip()],
        })

    for edu in _l(data.get("education")):
        if not isinstance(edu, dict):
            continue
        normalized["education"].append({
            "degree": _s(edu.get("degree")),
            "school": _s(edu.get("school")),
            "year": _s(edu.get("year")),
        })

    for proj in _l(data.get("projects")):
        if not isinstance(proj, dict):
            continue
        normalized["projects"].append({
            "title": _s(proj.get("title")),
            "description": _s(proj.get("description")),
        })

    return normalized


def fetch_jobs_from_adzuna(keywords, country="gb", per_page=10):
    """Fetch job listings from Adzuna API."""
    app_id = os.getenv("ADZUNA_APP_ID")
    app_key = os.getenv("ADZUNA_APP_KEY")
    if not app_id or not app_key:
        logging.warning("ADZUNA_APP_ID or ADZUNA_APP_KEY not set; returning empty job list")
        return []
    query = " ".join(keywords[:3])  # use first 3 keywords for search
    url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/1"
    params = {"app_id": app_id, "app_key": app_key, "what": query, "results_per_page": per_page}
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        results = data.get("results") or []
        jobs = []
        for r in results:
            jobs.append({
                "title": r.get("title", ""),
                "company": r.get("company", {}).get("display_name", "") if isinstance(r.get("company"), dict) else str(r.get("company", "")),
                "location": r.get("location", {}).get("display_name", "") if isinstance(r.get("location"), dict) else str(r.get("location", "")),
                "link": r.get("redirect_url", ""),
                "snippet": (r.get("description", "") or "")[:200],
            })
        return jobs
    except Exception as e:
        logging.exception("Adzuna API error: %s", e)
        return []

@app.before_request
def require_api_key():
    expected = os.getenv('AUTHORIZED_API_KEY') or ''
    expected = expected.strip()
    if not expected:
        return  # No key configured: allow all requests (e.g. local dev)
    api_key = (request.headers.get('X-API-KEY') or '').strip()
    if api_key != expected:
        return jsonify({'error': 'Unauthorized access'}), 403

@app.before_request
def log_request():
    logging.info(f"Request from {get_remote_address()} to {request.path}")

@app.route('/analyze', methods=['POST'])
@limiter.limit("10 per minute")
def analyze_resume():
    if 'resume' not in request.files or not request.files['resume']:
        return jsonify({'error': 'No resume file uploaded'}), 400
    
    job_description = request.form.get('jobDescription', '')
    if not job_description or len(job_description) < 10:
        return jsonify({'error': 'Invalid job description'}), 400
    
    file = request.files['resume']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        try:
            # Extract text based on file type
            if filename.endswith('.pdf'):
                resume_text = extract_text_from_pdf(file_path)
            else:  # docx
                resume_text = extract_text_from_docx(file_path)
            
            # Clean up the uploaded file
            os.remove(file_path)
            
            # Prepare prompt for Gemini
            prompt = f"""
            Please analyze this resume against the job description. Consider:
            1. Key skills match
            2. Experience relevance
            3. Missing critical requirements
            4. Suggested improvements
            
            Resume:
            {resume_text}
            
            Job Description:
            {job_description}
            """
            
            # Get text analysis from Gemini
            response = model.generate_content(
                prompt,
                generation_config = genai.GenerationConfig(
                    temperature=0.2,
                ))
            analysis = response.text

            # Build structured dashboard data by parsing the text analysis
            structured = None
            try:
                structured = extract_structured_from_analysis(analysis)
            except Exception as struct_err:
                logging.warning("Structured extraction failed: %s", struct_err)
            
            return jsonify({'analysis': analysis, 'structured': structured})
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/jobs/recommend', methods=['POST'])
@limiter.limit("20 per minute")
def jobs_recommend():
    """Recommend jobs based on resume (file or text)."""
    resume_text = request.form.get("resumeText", "").strip()
    file = request.files.get("resume") if "resume" in request.files else None

    if not resume_text and (not file or not file.filename):
        return jsonify({"error": "Provide resume file or resumeText"}), 400

    if file and file.filename and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        try:
            file.save(file_path)
            if filename.endswith(".pdf"):
                resume_text = extract_text_from_pdf(file_path)
            else:
                resume_text = extract_text_from_docx(file_path)
        finally:
            if os.path.exists(file_path):
                os.remove(file_path)

    if not resume_text or len(resume_text) < 20:
        return jsonify({"error": "Could not extract enough text from resume"}), 400

    keywords = extract_keywords_from_resume(resume_text)
    country = request.form.get("country", "gb")
    jobs = fetch_jobs_from_adzuna(keywords, country=country, per_page=10)
    return jsonify({"jobs": jobs})

IMPROVE_SYSTEM = """You are an expert resume writer. Given a resume, job description, and optional feedback, produce an IMPROVED version as plain text. Do NOT invent facts. Use section headers in ALL CAPS on their own line: SUMMARY, EXPERIENCE, EDUCATION, SKILLS. Output only the improved resume text."""

model_improve = genai.GenerativeModel(
    model_name='gemini-2.5-flash',
    system_instruction=IMPROVE_SYSTEM,
)

CV_JSON_SYSTEM = (
    "You are an expert resume writer. You ONLY output valid JSON. "
    "No markdown, no code fences, no explanation, no trailing commas. "
    "Given a resume and job description, return a single JSON object with these exact keys: "
    "name, title, contact (object with email/phone/location/website), summary, "
    "skills (array of strings), experience (array of objects with role/company/location/dates/bullets), "
    "education (array of objects with degree/school/year), "
    "projects (array of objects with title/description), hobbies (array of strings). "
    "Improve the content to match the job description. Do NOT invent facts."
)

model_cv_json = genai.GenerativeModel(
    model_name='gemini-2.5-flash',
    system_instruction=CV_JSON_SYSTEM,
)

def build_docx_from_text(text):
    """Build a simple DOCX from structured resume text (headers in ALL CAPS, then content)."""
    doc = DocxDocument()
    style = doc.styles['Normal']
    style.font.size = Pt(11)
    style.font.name = 'Calibri'
    lines = text.strip().split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.isupper() and len(line) > 1 and line.strip():
            # Section heading
            p = doc.add_paragraph()
            p.add_run(line.strip()).bold = True
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(6)
            i += 1
            continue
        # Content
        content = []
        while i < len(lines) and (not lines[i].isupper() or len(lines[i]) <= 1):
            content.append(lines[i].strip())
            i += 1
        block = "\n".join(content).strip()
        if block:
            for part in block.split("\n"):
                if part.strip():
                    doc.add_paragraph(part.strip())
    if not doc.paragraphs:
        doc.add_paragraph(text[:5000])
    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer


def build_pdf_from_text(text):
    """Build a professional PDF from structured resume text (headers in ALL CAPS, then content)."""
    from fpdf import FPDF

    class CVPDF(FPDF):
        def __init__(self):
            super().__init__()
            self.set_auto_page_break(auto=True, margin=20)

        def header(self):
            pass

        def footer(self):
            self.set_y(-15)
            self.set_font("Helvetica", "I", 8)
            self.set_text_color(128, 128, 128)
            w = self.w - self.l_margin - self.r_margin
            if w > 0:
                self.cell(w, 10, "CV generated by CVSmart", align="C")

    pdf = CVPDF()
    pdf.set_margins(25, 20, 25)
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(0, 0, 0)

    # Explicit width so multi_cell never gets 0 (avoids "Not enough horizontal space")
    usable_w = max(1, (pdf.w - pdf.l_margin - pdf.r_margin))

    lines = text.strip().split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.isupper() and len(line) > 1 and line.strip():
            pdf.set_font("Helvetica", "B", 12)
            pdf.set_text_color(0, 0, 0)
            pdf.ln(4)
            pdf.multi_cell(usable_w, 8, line.strip())
            pdf.ln(2)
            pdf.set_font("Helvetica", "", 11)
            i += 1
            continue
        content = []
        while i < len(lines) and (not lines[i].isupper() or len(lines[i]) <= 1):
            content.append(lines[i].strip())
            i += 1
        block = "\n".join(content).strip()
        if block:
            pdf.set_font("Helvetica", "", 11)
            pdf.set_text_color(40, 40, 40)
            for part in block.split("\n"):
                s = part.strip()
                if s:
                    pdf.multi_cell(usable_w, 6, s)
            pdf.ln(2)
    if pdf.page_no() == 1 and not lines:
        pdf.set_font("Helvetica", "", 11)
        pdf.multi_cell(usable_w, 6, text[:5000])
    buffer = io.BytesIO()
    buffer.write(pdf.output())
    buffer.seek(0)
    return buffer


def _latin1(text_value):
    """Safely encode text for FPDF's built-in Helvetica (latin-1 only)."""
    if not text_value:
        return ""
    s = str(text_value)
    return s.encode("latin-1", "replace").decode("latin-1")


def build_cv_pdf_from_sections(sections, template_id="classic"):
    """Build a professional CV PDF from structured sections dict."""
    from fpdf import FPDF

    class CVTemplatePDF(FPDF):
        def __init__(self):
            super().__init__()
            self.set_auto_page_break(auto=True, margin=18)
        def header(self):
            pass
        def footer(self):
            self.set_y(-12)
            self.set_font("Helvetica", "I", 7)
            self.set_text_color(160, 160, 160)
            w = self.w - self.l_margin - self.r_margin
            if w > 0:
                self.cell(w, 8, "Generated by CVSmart", align="C")

    pdf = CVTemplatePDF()
    pdf.set_margins(22, 18, 22)
    pdf.add_page()
    W = max(1, pdf.w - pdf.l_margin - pdf.r_margin)

    name = _latin1(sections.get("name") or "")
    title = _latin1(sections.get("title") or "")
    contact = sections.get("contact") or {}
    if not isinstance(contact, dict):
        contact = {}
    contact_parts = []
    for k in ("email", "phone", "location", "website"):
        v = _latin1(contact.get(k) or "").strip()
        if v:
            contact_parts.append(v)
    contact_line = "  |  ".join(contact_parts)
    summary = _latin1(sections.get("summary") or "")
    skills = sections.get("skills") or []
    experience = sections.get("experience") or []
    education = sections.get("education") or []
    projects = sections.get("projects") or []
    hobbies = sections.get("hobbies") or []

    # Colors per template
    if template_id == "modern":
        hdr_bg = (52, 58, 64)
        hdr_fg = (255, 255, 255)
        accent = (0, 123, 255)
        body_fg = (33, 37, 41)
        line_col = (0, 123, 255)
    elif template_id == "minimal":
        hdr_bg = None
        hdr_fg = (0, 0, 0)
        accent = (80, 80, 80)
        body_fg = (50, 50, 50)
        line_col = (200, 200, 200)
    else:
        hdr_bg = (245, 245, 245)
        hdr_fg = (0, 0, 0)
        accent = (30, 80, 160)
        body_fg = (40, 40, 40)
        line_col = (30, 80, 160)

    def _hr():
        pdf.set_draw_color(*line_col)
        y = pdf.get_y()
        pdf.line(pdf.l_margin, y, pdf.l_margin + W, y)
        pdf.ln(3)

    # ── NAME / TITLE / CONTACT ──
    if template_id == "modern" and hdr_bg:
        pdf.set_fill_color(*hdr_bg)
        pdf.set_text_color(*hdr_fg)
        pdf.set_font("Helvetica", "B", 22)
        pdf.cell(W, 13, name or "Candidate", ln=1, fill=True)
        if title:
            pdf.set_font("Helvetica", "", 12)
            pdf.cell(W, 8, title, ln=1, fill=True)
        if contact_line:
            pdf.set_font("Helvetica", "", 9)
            pdf.cell(W, 7, contact_line, ln=1, fill=True)
        pdf.ln(6)
    elif template_id == "minimal":
        pdf.set_text_color(*hdr_fg)
        pdf.set_font("Helvetica", "B", 20)
        pdf.cell(W, 11, name or "Candidate", ln=1)
        if title:
            pdf.set_font("Helvetica", "", 11)
            pdf.set_text_color(*accent)
            pdf.cell(W, 6, title, ln=1)
        if contact_line:
            pdf.set_font("Helvetica", "", 8)
            pdf.set_text_color(120, 120, 120)
            pdf.cell(W, 5, contact_line, ln=1)
        pdf.ln(2)
        _hr()
    else:
        if hdr_bg:
            pdf.set_fill_color(*hdr_bg)
        pdf.set_text_color(*hdr_fg)
        pdf.set_font("Helvetica", "B", 20)
        pdf.cell(W, 12, name or "Candidate", ln=1, fill=bool(hdr_bg))
        if title:
            pdf.set_font("Helvetica", "", 11)
            pdf.set_text_color(*accent)
            pdf.cell(W, 7, title, ln=1, fill=bool(hdr_bg))
        if contact_line:
            pdf.set_font("Helvetica", "", 8)
            pdf.set_text_color(100, 100, 100)
            pdf.cell(W, 6, contact_line, ln=1, fill=bool(hdr_bg))
        pdf.ln(4)
        _hr()

    def section_heading(label):
        pdf.ln(3)
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(*accent)
        pdf.cell(W, 7, label.upper(), ln=1)
        pdf.set_draw_color(*line_col)
        pdf.line(pdf.l_margin, pdf.get_y(), pdf.l_margin + W, pdf.get_y())
        pdf.ln(2)

    def body_text(txt, bold=False):
        pdf.set_font("Helvetica", "B" if bold else "", 10)
        pdf.set_text_color(*body_fg)
        pdf.multi_cell(W, 5, _latin1(txt))

    def bullet(txt):
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(*body_fg)
        pdf.cell(5, 5, "-")
        x = pdf.get_x()
        pdf.multi_cell(W - 5, 5, _latin1(txt))

    # ── SUMMARY ──
    if summary:
        section_heading("Professional Summary")
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(*body_fg)
        pdf.multi_cell(W, 5, summary)
        pdf.ln(1)

    # ── EXPERIENCE ──
    if isinstance(experience, list) and experience:
        section_heading("Experience")
        for exp in experience:
            if not isinstance(exp, dict):
                continue
            role = _latin1(exp.get("role") or "")
            company = _latin1(exp.get("company") or "")
            dates = _latin1(exp.get("dates") or "")
            loc = _latin1(exp.get("location") or "")
            line1 = role
            if company:
                line1 = f"{role}  -  {company}" if role else company
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(*body_fg)
            pdf.cell(W * 0.7, 5, line1)
            if dates:
                pdf.set_font("Helvetica", "I", 9)
                pdf.set_text_color(120, 120, 120)
                pdf.cell(W * 0.3, 5, dates, align="R")
            pdf.ln(5)
            if loc:
                pdf.set_font("Helvetica", "I", 8)
                pdf.set_text_color(130, 130, 130)
                pdf.cell(W, 4, loc, ln=1)
            bullets = exp.get("bullets") or []
            if isinstance(bullets, list):
                for b in bullets:
                    s = str(b or "").strip()
                    if s:
                        bullet(s)
            pdf.ln(2)

    # ── EDUCATION ──
    if isinstance(education, list) and education:
        section_heading("Education")
        for edu in education:
            if not isinstance(edu, dict):
                continue
            deg = _latin1(edu.get("degree") or "")
            sch = _latin1(edu.get("school") or "")
            yr = _latin1(edu.get("year") or "")
            line1 = deg
            if sch:
                line1 = f"{deg}  -  {sch}" if deg else sch
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(*body_fg)
            pdf.cell(W * 0.7, 5, line1)
            if yr:
                pdf.set_font("Helvetica", "I", 9)
                pdf.set_text_color(120, 120, 120)
                pdf.cell(W * 0.3, 5, yr, align="R")
            pdf.ln(6)

    # ── SKILLS ──
    if isinstance(skills, list) and skills:
        section_heading("Skills")
        safe_skills = [_latin1(str(s).strip()) for s in skills if str(s).strip()]
        chunks = [safe_skills[i:i+5] for i in range(0, len(safe_skills), 5)]
        for chunk in chunks:
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(*body_fg)
            pdf.multi_cell(W, 5, "  |  ".join(chunk))
        pdf.ln(1)

    # ── PROJECTS ──
    if isinstance(projects, list) and projects:
        section_heading("Projects")
        for proj in projects:
            if not isinstance(proj, dict):
                continue
            t = _latin1(proj.get("title") or "")
            d = _latin1(proj.get("description") or "")
            if t:
                body_text(t, bold=True)
            if d:
                body_text(d)
            pdf.ln(2)

    # ── HOBBIES ──
    if isinstance(hobbies, list) and hobbies:
        section_heading("Interests")
        safe_hobbies = [_latin1(str(h).strip()) for h in hobbies if str(h).strip()]
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(*body_fg)
        pdf.multi_cell(W, 5, "  |  ".join(safe_hobbies))

    buf = io.BytesIO()
    buf.write(pdf.output())
    buf.seek(0)
    return buf


@app.route('/cv/improve', methods=['POST'])
@limiter.limit("10 per minute")
def cv_improve():
    """Generate improved CV as DOCX from resume + job description + optional analysis."""
    if 'resume' not in request.files or not request.files['resume']:
        return jsonify({'error': 'No resume file uploaded'}), 400
    job_description = request.form.get('jobDescription', '').strip()
    if not job_description or len(job_description) < 10:
        return jsonify({'error': 'Job description required'}), 400
    analysis_text = request.form.get('analysis', '').strip()

    file = request.files['resume']
    if not file.filename or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    try:
        if filename.endswith('.pdf'):
            resume_text = extract_text_from_pdf(file_path)
        else:
            resume_text = extract_text_from_docx(file_path)
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

    if not resume_text.strip():
        return jsonify({'error': 'Could not extract text from resume'}), 400

    prompt = f"""Resume:\n{resume_text[:6000]}\n\nJob description:\n{job_description[:3000]}\n\n"""
    if analysis_text:
        prompt += f"Feedback to apply:\n{analysis_text[:3000]}\n\n"
    prompt += "Output the improved resume as plain text with section headers in ALL CAPS."

    try:
        response = model_improve.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(temperature=0.3, max_output_tokens=4000),
        )
        improved_text = (response.text or "").strip()
        if not improved_text:
            return jsonify({'error': 'Failed to generate improved resume'}), 500
        want_pdf = request.form.get('format', '').strip().lower() == 'pdf'
        if want_pdf:
            buffer = build_pdf_from_text(improved_text)
            return send_file(
                buffer,
                mimetype='application/pdf',
                as_attachment=True,
                download_name='improved_cv.pdf',
            )
        buffer = build_docx_from_text(improved_text)
        return send_file(
            buffer,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            as_attachment=True,
            download_name='improved_cv.docx',
        )
    except Exception as e:
        logging.exception("cv_improve error: %s", e)
        return jsonify({'error': str(e)}), 500


@app.route('/cv/templates', methods=['POST'])
@limiter.limit("10 per minute")
def cv_templates():
    """Return structured CV sections JSON generated by Gemini."""
    if 'resume' not in request.files or not request.files['resume']:
        return jsonify({'error': 'No resume file uploaded'}), 400
    job_description = (request.form.get('jobDescription') or '').strip()
    if not job_description or len(job_description) < 10:
        return jsonify({'error': 'Job description required'}), 400
    analysis_text = (request.form.get('analysis') or '').strip()

    file = request.files['resume']
    if not file.filename or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    try:
        file.save(file_path)
        if filename.endswith('.pdf'):
            resume_text = extract_text_from_pdf(file_path)
        else:
            resume_text = extract_text_from_docx(file_path)
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

    if not resume_text.strip():
        return jsonify({'error': 'Could not extract text from resume'}), 400

    try:
        sections = generate_structured_cv_sections(resume_text, job_description, analysis_text)
    except Exception as e:
        msg = str(e)
        logging.exception("cv/templates error: %s", e)
        if "429" in msg or "ResourceExhausted" in msg:
            return jsonify({'error': 'Gemini quota exceeded – please try again later.'}), 503
        # Surface the underlying error to the client to make debugging easier.
        return jsonify({'error': msg or 'Failed to generate CV structure'}), 500

    return jsonify({'sections': sections})

def build_cv_docx(sections):
    """Build DOCX from CV builder sections dict."""
    doc = DocxDocument()
    style = doc.styles['Normal']
    style.font.size = Pt(11)
    style.font.name = 'Calibri'

    def add_heading(text):
        p = doc.add_paragraph()
        p.add_run(text).bold = True
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(6)

    def add_para(text):
        if text and str(text).strip():
            doc.add_paragraph(str(text).strip())

    summary = sections.get("summary") or ""
    if summary:
        add_heading("SUMMARY")
        add_para(summary)

    experience = sections.get("experience") or []
    if experience:
        add_heading("EXPERIENCE")
        for exp in experience:
            if isinstance(exp, dict):
                role = exp.get("role") or ""
                company = exp.get("company") or ""
                dates = exp.get("dates") or ""
                bullets = exp.get("bullets") or []
                if role or company:
                    add_para(f"{role} at {company}" + (f" — {dates}" if dates else ""))
                for b in bullets if isinstance(bullets, list) else [bullets]:
                    if b and str(b).strip():
                        doc.add_paragraph(str(b).strip(), style='List Bullet')
            elif isinstance(exp, str) and exp.strip():
                add_para(exp)

    education = sections.get("education") or []
    if education:
        add_heading("EDUCATION")
        for edu in education:
            if isinstance(edu, dict):
                degree = edu.get("degree") or ""
                school = edu.get("school") or ""
                year = edu.get("year") or ""
                add_para(f"{degree} — {school}" + (f", {year}" if year else ""))
            elif isinstance(edu, str) and edu.strip():
                add_para(edu)

    skills = sections.get("skills") or []
    if skills:
        add_heading("SKILLS")
        if isinstance(skills, list):
            add_para(", ".join(str(s).strip() for s in skills if s and str(s).strip()))
        else:
            add_para(str(skills))

    projects = sections.get("projects") or []
    if projects:
        add_heading("PROJECTS")
        for proj in projects:
            if isinstance(proj, dict):
                title = proj.get("title") or ""
                desc = proj.get("description") or ""
                add_para(title)
                if desc:
                    add_para(desc)
            elif isinstance(proj, str) and proj.strip():
                add_para(proj)

    if not doc.paragraphs:
        doc.add_paragraph("No content added yet.")
    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer

@app.route('/cv/build', methods=['POST'])
@limiter.limit("20 per minute")
def cv_build():
    """Build CV DOCX from JSON (templateId + sections)."""
    try:
        data = request.get_json() or {}
    except Exception:
        return jsonify({"error": "Invalid JSON"}), 400
    template_id = data.get("templateId", "classic")
    sections = data.get("sections") or {}
    if not isinstance(sections, dict):
        return jsonify({"error": "sections must be an object"}), 400
    try:
        buffer = build_cv_docx(sections)
        from flask import send_file
        return send_file(
            buffer,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            as_attachment=True,
            download_name='my_cv.docx',
        )
    except Exception as e:
        logging.exception("cv/build error: %s", e)
        return jsonify({"error": str(e)}), 500


@app.route('/cv/build/pdf', methods=['POST'])
@limiter.limit("10 per minute")
def cv_build_pdf():
    """Build CV PDF from JSON (templateId + sections)."""
    try:
        data = request.get_json() or {}
    except Exception:
        return jsonify({"error": "Invalid JSON"}), 400
    template_id = str(data.get("templateId") or "classic").strip().lower()
    sections = data.get("sections") or {}
    if not isinstance(sections, dict):
        return jsonify({"error": "sections must be an object"}), 400
    if template_id not in {"classic", "modern", "minimal"}:
        template_id = "classic"
    try:
        buffer = build_cv_pdf_from_sections(sections, template_id)
        return send_file(
            buffer,
            mimetype="application/pdf",
            as_attachment=True,
            download_name="improved_cv.pdf",
        )
    except Exception as e:
        logging.exception("cv/build/pdf error: %s", e)
        return jsonify({"error": str(e)}), 500

ASSESS_PROMPT = """Based on the job description below, generate exactly 6 multiple-choice questions that candidates are likely to be asked in interviews for this role.
Include a mix of: role-specific technical or situational questions, behavioral questions relevant to the responsibilities, and questions about skills/experience mentioned in the JD.
For each question provide:
- question: the question text
- options: an object with keys A, B, C, D and string values (the answer choices)
- correct: exactly one of "A", "B", "C", "D"
- explanation: a short explanation or tip for answering (1-2 sentences)

Output ONLY a single JSON object. No markdown, no code fences, no text before or after. Valid JSON only:
{"questions": [{"question": "Question text?", "options": {"A": "Choice A", "B": "Choice B", "C": "Choice C", "D": "Choice D"}, "correct": "A", "explanation": "Short explanation."}]}"""

@app.route('/assess/generate', methods=['POST'])
@limiter.limit("10 per minute")
def assess_generate():
    """Generate interview preparation MCQ questions from job description (and optional resume)."""
    job_description = request.form.get("jobDescription", "").strip()
    if not job_description or len(job_description) < 20:
        return jsonify({"error": "Job description required (min 20 chars)"}), 400

    resume_text = request.form.get("resumeText", "").strip()
    file = request.files.get("resume") if "resume" in request.files else None
    if file and file.filename and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        try:
            file.save(file_path)
            resume_text = extract_text_from_pdf(file_path) if filename.endswith(".pdf") else extract_text_from_docx(file_path)
        finally:
            if os.path.exists(file_path):
                os.remove(file_path)

    prompt = f"Job description:\n{job_description[:4000]}\n\n"
    if resume_text:
        prompt += f"Candidate resume (for context only):\n{resume_text[:2000]}\n\n"
    prompt += ASSESS_PROMPT

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(temperature=0.4, max_output_tokens=4000),
        )
        text = (response.text or "").strip()
        # Strip markdown code block if present (e.g. ```json ... ``` or ```\n...```)
        if "```" in text:
            parts = re.split(r"```(?:\w*)\s*\n?", text, maxsplit=1)
            if len(parts) > 1:
                text = parts[1]
            text = re.sub(r"\s*```\s*$", "", text)
        text = text.strip()
        # Extract JSON object: find first { and last }
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            text = text[start : end + 1]
        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            # Try removing trailing commas before ] or }
            text_fixed = re.sub(r",\s*([}\]])", r"\1", text)
            try:
                data = json.loads(text_fixed)
            except json.JSONDecodeError as parse_err:
                logging.warning("assess/generate raw response (first 500 chars): %s", text[:500])
                raise parse_err
        questions = data.get("questions") or []
        if not isinstance(questions, list):
            questions = []
        # Validate shape
        out = []
        for q in questions[:8]:
            if not isinstance(q, dict): continue
            opts = q.get("options") or {}
            if not all(k in opts for k in ("A", "B", "C", "D")): continue
            correct = q.get("correct")
            if correct not in ("A", "B", "C", "D"): continue
            out.append({
                "question": str(q.get("question", "")),
                "options": {k: str(opts.get(k, "")) for k in ("A", "B", "C", "D")},
                "correct": correct,
                "explanation": str(q.get("explanation", "")),
            })
        return jsonify({"questions": out})
    except json.JSONDecodeError as e:
        logging.warning("assess/generate JSON parse error: %s", e)
        return jsonify({"error": "Failed to generate questions", "questions": []}), 200
    except Exception as e:
        logging.exception("assess/generate error: %s", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)