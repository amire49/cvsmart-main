export interface ExperienceItem {
  role: string;
  company: string;
  dates: string;
  bullets: string[];
}

export interface EducationItem {
  degree: string;
  school: string;
  year: string;
}

export interface ProjectItem {
  title: string;
  description: string;
}

export interface CVData {
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  projects: ProjectItem[];
}
