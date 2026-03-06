from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging
import pdfplumber
from docx import Document
import google.generativeai as genai
import os
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

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

@app.before_request
def require_api_key():
    api_key = request.headers.get('X-API-KEY')
    if api_key != os.getenv('AUTHORIZED_API_KEY'):
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
            
            # Get analysis from Gemini
            response = model.generate_content(
                prompt,
                generation_config = genai.GenerationConfig(
                    temperature=0.2,
                ))
            analysis = response.text
            
            return jsonify({'analysis': analysis})
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'Invalid file type'}), 400

if __name__ == '__main__':
    app.run(debug=True)