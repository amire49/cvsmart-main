"use client";

import React, { useState, useEffect, useRef, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Briefcase,
  ExternalLink,
  Download,
  FileDown,
  RefreshCw,
  Search,
  Zap,
  Calendar,
  Building2,
  MessageCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Analytics } from "@vercel/analytics/next";
import { TemplateSelector, TEMPLATE_MAP } from "@/components/cv-templates";
import type { CVData, TemplateId } from "@/components/cv-templates";
import { generatePdfFromElement } from "@/lib/generate-pdf";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

interface StructuredAnalysis {
  overallScore: number;
  verdict: string;
  verdictColor: string;
  sections: {
    id: string;
    label: string;
    score: number;
    color: string;
    icon: string;
    details: string[];
  }[];
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

interface JobItem {
  title: string;
  company: string;
  location: string;
  link: string;
  snippet: string;
  source?: string;
}

interface QuizQuestion {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: "A" | "B" | "C" | "D";
  explanation: string;
}

interface CvExperienceItem {
  role: string;
  company: string;
  location?: string;
  dates?: string;
  bullets?: string[];
}

interface CvEducationItem {
  degree: string;
  school: string;
  year?: string;
}

interface CvProjectItem {
  title: string;
  description: string;
}

interface CvContact {
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
}

interface StructuredCvSections {
  name: string;
  title: string;
  contact: CvContact;
  summary: string;
  skills: string[];
  experience: CvExperienceItem[];
  education: CvEducationItem[];
  projects?: CvProjectItem[];
  hobbies?: string[];
}

function mapSectionsToCVData(s: StructuredCvSections): CVData {
  return {
    personal: {
      fullName: s.name || "",
      title: s.title || "",
      email: s.contact?.email || "",
      phone: s.contact?.phone || "",
      location: s.contact?.location || "",
      website: s.contact?.website || "",
      linkedin: "",
      github: "",
    },
    summary: s.summary || "",
    experience: (s.experience || []).map((e) => ({
      role: e.role || "",
      company: e.company || "",
      dates: e.dates || "",
      bullets: e.bullets || [],
    })),
    education: (s.education || []).map((e) => ({
      degree: e.degree || "",
      school: e.school || "",
      year: e.year || "",
    })),
    skills: s.skills || [],
    projects: (s.projects || []).map((p) => ({
      title: p.title || "",
      description: p.description || "",
    })),
  };
}

const MAX_FILE_SIZE_MB = 10;

const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  technical: Zap,
  experience: Calendar,
  projects: Building2,
  softskills: MessageCircle,
};

function SectionIcon({ id, className, style }: { id: string; className?: string; style?: React.CSSProperties }) {
  const Icon = SECTION_ICONS[id] ?? FileText;
  return <Icon className={className} style={style} />;
}

/* ---------- Animated Score Ring ---------- */
function AnimatedScore({
  target,
  color,
  size = 130,
  stroke = 9,
}: {
  target: number;
  color: string;
  size?: number;
  stroke?: number;
}) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 1400;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(ease * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (current / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: "stroke-dasharray 0.05s" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          transform: "rotate(90deg)",
          transformOrigin: "50% 50%",
          fill: "currentColor",
          fontSize: size * 0.22,
          fontFamily: "monospace",
          fontWeight: 700,
        }}
      >
        {current}
      </text>
    </svg>
  );
}

/* ---------- Mini bar ---------- */
function MiniBar({ score, color }: { score: number; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(score), 200);
    return () => clearTimeout(t);
  }, [score]);
  return (
    <div className="bg-muted/30 rounded h-1.5 overflow-hidden flex-1">
      <div
        className="h-full rounded transition-all duration-1000"
        style={{ width: `${w}%`, background: color, boxShadow: `0 0 6px ${color}` }}
      />
    </div>
  );
}

/* ---------- Step Progress ---------- */
function StepProgressBar({
  currentStep,
  completedThrough,
  stepLabels,
  loadingOnStep3,
  step3ProgressPercent = 0,
}: {
  currentStep: 1 | 2 | 3;
  completedThrough: number;
  stepLabels: [string, string, string];
  loadingOnStep3?: boolean;
  step3ProgressPercent?: number;
}) {
  const steps = [
    { id: 1 as const, label: stepLabels[0] },
    { id: 2 as const, label: stepLabels[1] },
    { id: 3 as const, label: stepLabels[2] },
  ];
  const fillPercent =
    loadingOnStep3
      ? 50 + (step3ProgressPercent / 100) * 50
      : Math.min(100, (completedThrough / 2) * 100);
  return (
    <nav aria-label={`Step ${currentStep} of 3`} className="relative z-10 w-full max-w-2xl mx-auto">
      <div className="absolute left-0 right-0 top-5 h-0.5 -translate-y-1/2 bg-muted" />
      <div
        className="absolute left-0 top-5 h-0.5 -translate-y-1/2 bg-success transition-all duration-500 ease-out"
        style={{ width: `${fillPercent}%` }}
      />
      <ol className="relative flex items-start justify-between" role="list">
        {steps.map((step) => {
          const isCompleted = completedThrough >= step.id;
          const isActive = currentStep === step.id;
          const isStep3Loading = step.id === 3 && loadingOnStep3;
          return (
            <li key={step.id} className="flex flex-1 flex-col items-center" aria-current={isActive ? "step" : undefined}>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  isCompleted && !isStep3Loading
                    ? "border-transparent bg-success text-success-foreground"
                    : isActive || isStep3Loading
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-border bg-transparent text-muted-foreground"
                }`}
              >
                {isCompleted && !isActive && !isStep3Loading ? (
                  <Check className="h-5 w-5" />
                ) : isStep3Loading ? (
                  <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </div>
              <span className={`mt-2 text-sm font-medium ${isActive || isStep3Loading ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default function ResumeAnalyzer() {
  const t = useTranslations("analyze");
  const tCommon = useTranslations("common");
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [structured, setStructured] = useState<StructuredAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [downloadingCv, setDownloadingCv] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, "A" | "B" | "C" | "D">>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "breakdown" | "actions">("overview");
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [cvTemplatesOpen, setCvTemplatesOpen] = useState(false);
  const [cvTemplatesLoading, setCvTemplatesLoading] = useState(false);
  const [cvSections, setCvSections] = useState<StructuredCvSections | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId | null>(null);
  const pdfRenderRef = useRef<HTMLDivElement>(null);

  const completedThrough =
    currentStep === 3 ? (loading ? 2 : 3) : currentStep === 2 ? 1 : 0;
  const loadingOnStep3 = currentStep === 3 && loading && !structured;
  const stepLabels: [string, string, string] = [t("stepUpload"), t("stepJobDesc"), t("stepResults")];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const fileSizeMB = selectedFile.size / (1024 * 1024);
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        toast.error(t("errorMaxSize", { max: MAX_FILE_SIZE_MB }));
        setFile(null);
      } else if (
        !["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(selectedFile.type)
      ) {
        toast.error(t("errorFileType"));
        setFile(null);
      } else {
        setFile(selectedFile);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file || !jobDescription.trim()) {
      toast.error(t("errorUploadAndJob"));
      return;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setLoading(true);
    setProgress(0);
    setCurrentStep(3);
    progressIntervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          return 90;
        }
        return p + 4;
      });
    }, 180);
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);
    // Do not set Content-Type: fetch will set multipart/form-data with the correct boundary
    const headers: Record<string, string> = {};
    try {
      const response = await fetch(`${API_BASE}/analyze`, { method: "POST", body: formData, headers });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error((data as { error?: string }).error || t("errorTryAgain"));
        return;
      }
      setAnalysis((data as { analysis: string }).analysis || "");
      setStructured((data as { structured?: StructuredAnalysis }).structured || null);
      setActiveTab("overview");
      setProgress(100);
      toast.success(t("toastAnalysisComplete"));
    } catch (err) {
      console.error("Error during analysis:", err);
      toast.error("Cannot reach the server. Is the backend running at " + API_BASE + "?");
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setCurrentStep(1);
    setProgress(0);
    setAnalysis("");
    setStructured(null);
    setFile(null);
    setJobDescription("");
    setJobs([]);
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setActiveTab("overview");
    setCvSections(null);
    setCvTemplatesOpen(false);
    setSelectedTemplateId(null);
  };

  const handleGetJobRecommendations = async () => {
    if (!file) { toast.error(t("errorUploadAndJob")); return; }
    setLoadingJobs(true);
    setJobs([]);
    const formData = new FormData();
    formData.append("resume", file);
    if (jobDescription.trim()) formData.append("jobDescription", jobDescription.trim());
    try {
      const response = await fetch(`${API_BASE}/jobs/recommend`, {
        method: "POST",
        body: formData,
      } as RequestInit);
      const data = await response.json();
      if (!response.ok) { toast.error(data.error || t("errorTryAgain")); return; }
      setJobs(data.jobs || []);
      if (!(data.jobs?.length)) toast.success("No jobs found for your profile.");
    } catch { toast.error(t("errorTryAgain")); } finally { setLoadingJobs(false); }
  };

  const handleDownloadImprovedCv = async () => {
    if (!file || !jobDescription.trim()) return;
    setDownloadingCv(true);
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);
    if (analysis) formData.append("analysis", analysis);
    const headers: Record<string, string> = {};
    try {
      const response = await fetch(`${API_BASE}/cv/improve`, { method: "POST", body: formData, headers });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error((data as { error?: string }).error || t("errorTryAgain"));
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "improved_cv.docx";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch { toast.error(t("errorTryAgain")); } finally { setDownloadingCv(false); }
  };

  const handleDownloadImprovedCvPdf = async () => {
    if (!file || !jobDescription.trim()) return;
    if (cvSections) {
      setCvTemplatesOpen(true);
      return;
    }
    setDownloadingPdf(true);
    setCvTemplatesLoading(true);
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);
    if (analysis) formData.append("analysis", analysis);
    const headers: Record<string, string> = {};
    try {
      const response = await fetch(`${API_BASE}/cv/templates`, { method: "POST", body: formData, headers });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorMessage = (data as { error?: string }).error;
        if (errorMessage) {
          toast.error(errorMessage);
        } else {
          toast.error(t("errorTryAgain"));
        }
        return;
      }
      const sections = (data as { sections?: StructuredCvSections }).sections || null;
      if (!sections) {
        toast.error(t("errorTryAgain"));
        return;
      }
      setCvSections(sections);
      setSelectedTemplateId("classic");
      setCvTemplatesOpen(true);
    } catch {
      toast.error(t("errorTryAgain"));
    } finally {
      setCvTemplatesLoading(false);
      setDownloadingPdf(false);
    }
  };

  const handleConfirmTemplateDownload = async () => {
    if (!cvSections || !selectedTemplateId) return;
    setDownloadingPdf(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      const el = pdfRenderRef.current;
      if (!el) { toast.error("Render container not ready"); return; }
      await generatePdfFromElement(el, "improved_cv.pdf");
      toast.success("PDF downloaded!");
      setCvTemplatesOpen(false);
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("PDF generation failed. Check console for details.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleStartAssessment = async () => {
    if (!jobDescription.trim()) { toast.error(t("errorUploadAndJob")); return; }
    setLoadingQuiz(true);
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizSubmitted(false);
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    if (file) formData.append("resume", file);
    const headers: Record<string, string> = {};
    try {
      const response = await fetch(`${API_BASE}/assess/generate`, { method: "POST", body: formData, headers });
      const data = await response.json();
      if (!response.ok) { toast.error((data as { error?: string }).error || t("errorTryAgain")); return; }
      const questions = (data.questions as QuizQuestion[]) || [];
      if ((data as { error?: string }).error && questions.length === 0) toast.error((data as { error?: string }).error);
      setQuizQuestions(questions);
    } catch { toast.error(t("errorTryAgain")); } finally { setLoadingQuiz(false); }
  };

  const handleQuizSubmit = () => setQuizSubmitted(true);

  const quizScore =
    quizSubmitted && quizQuestions.length > 0 ? quizQuestions.filter((q, i) => quizAnswers[i] === q.correct).length : 0;

  const s = structured;

  return (
    <div className="app-page min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-success rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-ring rounded-full filter blur-[150px] opacity-10" />
      </div>

      <header className="relative z-10 py-12 px-4 border-b border-border backdrop-blur-md">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center tracking-tight font-sans">
            {t("title")} <span className="text-display font-serif italic">{t("titleItalic")}</span>
          </h1>
          <p className="text-center mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>
      </header>

      <div className="relative z-10 container mx-auto max-w-6xl px-4 pt-8">
        <StepProgressBar
          currentStep={currentStep}
          completedThrough={completedThrough}
          stepLabels={stepLabels}
          loadingOnStep3={loadingOnStep3}
          step3ProgressPercent={progress}
        />
      </div>

      <main className="relative z-10 container mx-auto max-w-6xl p-6 md:p-8 pb-12">
        {/* ---- Step 1 ---- */}
        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-xl font-semibold">{t("uploadResume")}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <label className="flex flex-col items-center justify-center w-full h-48 border border-dashed border-border rounded-xl cursor-pointer bg-muted hover:bg-accent transition-all duration-300">
                  <div className="flex flex-col items-center pt-5 pb-6">
                    {file ? (
                      <>
                        <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mb-4">
                          <FileText className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <p className="mb-2 text-sm"><span className="font-medium text-foreground">{file.name}</span></p>
                        <p className="text-xs text-muted-foreground">{t("clickToChange")}</p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 border border-border">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-medium text-foreground">{t("clickToUpload")}</span> {t("orDragDrop")}</p>
                        <p className="text-xs text-muted-foreground">{t("pdfOrDocx")}</p>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
                </label>
              </CardContent>
            </Card>
            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(2)} disabled={!file} className="rounded-full px-8 py-3 h-auto text-base font-medium inline-flex items-center gap-2">
                {t("next")} <ArrowRight className="h-5 w-5 shrink-0" />
              </Button>
            </div>
          </div>
        )}

        {/* ---- Step 2 ---- */}
        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <p className="text-foreground text-center md:text-left">{t("pasteJobDesc")}</p>
            <Card className="backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-xl font-semibold">{t("jobDescription")}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  placeholder={t("placeholderJobDesc")}
                  className="h-[240px] min-h-[240px] max-h-[240px] overflow-y-auto bg-muted border-input text-foreground placeholder:text-muted-foreground resize-none"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </CardContent>
            </Card>
            {loading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2 bg-muted" />
                <p className="text-xs text-muted-foreground text-center">{progress < 100 ? t("analyzingResume") : t("analysisComplete")}</p>
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)} disabled={loading} className="rounded-full px-6 py-3 h-auto font-medium inline-flex items-center gap-2">
                <ArrowLeft className="h-5 w-5 shrink-0" /> {t("back")}
              </Button>
              <Button onClick={handleAnalyze} disabled={loading || !file || !jobDescription.trim()} className="rounded-full px-8 py-3 h-auto text-base font-medium inline-flex items-center gap-2">
                {loading ? (
                  <>
                    <div className="animate-spin shrink-0"><div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full" /></div>
                    {t("analyzing")}
                  </>
                ) : (
                  <>{t("analyzeButton")} <ArrowRight className="h-5 w-5 shrink-0" /></>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ---- Step 3: Results or Loading ---- */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {loading && !s ? (
              <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
                <Card className="backdrop-blur-sm overflow-hidden">
                  <CardHeader className="border-b border-border">
                    <CardTitle className="text-xl font-semibold">{t("jobDescription")}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-[240px] min-h-[240px] max-h-[240px] overflow-y-auto bg-muted border border-input rounded-md px-3 py-2 text-sm text-foreground whitespace-pre-wrap">
                      {jobDescription || t("placeholderJobDesc")}
                    </div>
                  </CardContent>
                </Card>
                <div className="space-y-4">
                  <Progress value={progress} className="h-2 bg-muted" />
                  <div className="flex justify-center">
                    <Button disabled className="rounded-full px-8 py-3 h-auto text-base font-medium inline-flex items-center gap-2">
                      <div className="animate-spin shrink-0"><div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full" /></div>
                      {t("analyzing")}
                    </Button>
                  </div>
                </div>
              </div>
            ) : s ? (
              <>
                {/* Hero row */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-7">
                    <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Applying for</p>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">{jobDescription.split("\n")[0].slice(0, 80)}</h2>
                    <div className="mt-4 flex items-center gap-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-sm font-semibold rounded-lg px-3 py-1.5"
                        style={{ background: `${s.verdictColor}18`, border: `1px solid ${s.verdictColor}40`, color: s.verdictColor }}
                      >
                        ⬡ {s.verdict}
                      </span>
                      <span className="text-sm text-muted-foreground">Based on 4 weighted dimensions</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm px-8 py-6 flex flex-col items-center gap-2 min-w-[180px]">
                    <p className="text-[11px] tracking-widest uppercase text-muted-foreground">Overall Match</p>
                    <AnimatedScore target={s.overallScore} color="#00e5a0" />
                    <p className="text-xs text-muted-foreground">out of 100</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-xl bg-muted/30 border border-border w-fit">
                  {(["overview", "breakdown", "actions"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab
                          ? "bg-success/15 text-success outline outline-1 outline-success/25"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* OVERVIEW */}
                {activeTab === "overview" && (
                  <div className="space-y-5 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {s.sections.map((sec) => (
                        <div
                          key={sec.id}
                          onMouseEnter={() => setHoveredSection(sec.id)}
                          onMouseLeave={() => setHoveredSection(null)}
                          className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-5 transition-all hover:-translate-y-0.5"
                          style={{ borderColor: hoveredSection === sec.id ? `${sec.color}60` : undefined }}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-foreground" style={{ color: sec.color }}>
                              <SectionIcon id={sec.id} className="h-5 w-5" />
                            </span>
                            <span className="font-mono text-xl font-bold" style={{ color: sec.color }}>{sec.score}</span>
                          </div>
                          <p className="text-xs text-muted-foreground font-medium mb-2">{sec.label}</p>
                          <MiniBar score={sec.score} color={sec.color} />
                          <ul className="mt-3 space-y-1">
                            {sec.details.map((d, idx) => (
                              <li key={idx} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                                <span style={{ color: sec.color }} className="text-[8px] mt-1 shrink-0">◆</span>
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6">
                        <h3 className="text-xs tracking-widest uppercase text-success mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-success" /> Strengths
                        </h3>
                        {s.strengths.map((str, i) => (
                          <div key={i} className="flex gap-3 mb-3 items-start">
                            <TrendingUp className="h-4 w-4 shrink-0 text-success mt-0.5" />
                            <p className="text-sm text-muted-foreground leading-relaxed">{str}</p>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6">
                        <h3 className="text-xs tracking-widest uppercase text-destructive mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive" /> Gaps
                        </h3>
                        {s.gaps.map((g, i) => (
                          <div key={i} className="flex gap-3 mb-3 items-start">
                            <TrendingDown className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                            <p className="text-sm text-muted-foreground leading-relaxed">{g}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6" style={{ borderColor: `${s.verdictColor}30`, background: `${s.verdictColor}08` }}>
                      <h3 className="text-xs tracking-widest uppercase mb-3" style={{ color: s.verdictColor }}>AI Recommendation</h3>
                      <p className="text-sm text-foreground/80 leading-relaxed">{s.recommendation}</p>
                    </div>
                  </div>
                )}

                {/* BREAKDOWN */}
                {activeTab === "breakdown" && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    {s.sections.map((sec) => (
                      <div key={sec.id} className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <span style={{ color: sec.color }}><SectionIcon id={sec.id} className="h-6 w-6" /></span>
                          <div className="flex-1">
                            <div className="flex justify-between mb-2">
                              <span className="font-semibold text-foreground">{sec.label}</span>
                              <span className="font-mono font-bold" style={{ color: sec.color }}>{sec.score}/100</span>
                            </div>
                            <MiniBar score={sec.score} color={sec.color} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {sec.details.map((d, idx) => (
                            <div key={idx} className="bg-muted/30 rounded-lg px-3 py-2 text-sm text-muted-foreground flex items-start gap-2">
                              <span style={{ color: sec.color }} className="text-[8px] mt-1.5 shrink-0">◆</span>
                              <span>{d}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {analysis && (
                      <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6">
                        <h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Full Analysis
                        </h3>
                        <div className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground text-sm">
                          <AnalysisDisplay analysis={analysis} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ACTIONS */}
                {activeTab === "actions" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Download CV section */}
                    <div>
                      <h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Download improved CV</h3>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={handleDownloadImprovedCv}
                          disabled={downloadingCv}
                          className="inline-flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 px-5 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-success/50 disabled:opacity-60"
                        >
                          <div className="w-10 h-10 rounded-lg bg-success/15 border border-success/30 flex items-center justify-center shrink-0">
                            <Download className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{downloadingCv ? tCommon("loading") : t("downloadImprovedCv")}</p>
                            <p className="text-xs text-muted-foreground">DOCX format</p>
                          </div>
                        </button>
                        {/* PDF download commented out - DOCX only for now
                        <button
                          onClick={handleDownloadImprovedCvPdf}
                          disabled={downloadingPdf}
                          className="inline-flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 px-5 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-success/50 disabled:opacity-60"
                        >
                          <div className="w-10 h-10 rounded-lg bg-success/15 border border-success/30 flex items-center justify-center shrink-0">
                            <FileDown className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{downloadingPdf ? tCommon("loading") : "Download PDF"}</p>
                            <p className="text-xs text-muted-foreground">PDF format</p>
                          </div>
                        </button>
                        */}
                      </div>
                    </div>

                    {/* Job search & Interview prep - side by side */}
                    <div>
                      <h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Prepare for your next steps</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-border bg-card/60 p-5 space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
                              <Search className="h-4 w-4 text-violet-500" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{t("getJobRecommendations")}</p>
                              <p className="text-xs text-muted-foreground">Find roles that match your profile worldwide</p>
                            </div>
                          </div>
                          <button
                            onClick={handleGetJobRecommendations}
                            disabled={loadingJobs}
                            className="w-full rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 px-4 py-2.5 text-sm font-medium text-violet-400 transition-colors disabled:opacity-60"
                          >
                            {loadingJobs ? tCommon("loading") : "Find jobs"}
                          </button>
                        </div>

                        <div className="rounded-xl border border-border bg-card/60 p-5 space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                              <Sparkles className="h-4 w-4 text-cyan-500" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{t("interviewPrep")}</p>
                              <p className="text-xs text-muted-foreground">{t("interviewPrepNote")}</p>
                            </div>
                          </div>
                          <button
                            onClick={handleStartAssessment}
                            disabled={loadingQuiz || !jobDescription.trim()}
                            className="w-full rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 px-4 py-2.5 text-sm font-medium text-cyan-400 transition-colors disabled:opacity-60"
                          >
                            {loadingQuiz ? tCommon("loading") : "Generate practice questions"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleStartOver}
                      className="w-full rounded-xl border border-border bg-card/60 p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <RefreshCw className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-foreground">{t("startOver")}</p>
                        <p className="text-xs text-muted-foreground">Match against a different job description</p>
                      </div>
                    </button>
                  </div>
                )}
              </>
            ) : analysis ? (
              <div className="max-w-2xl mx-auto">
                <Card className="backdrop-blur-sm overflow-hidden">
                  <CardHeader className="border-b border-border">
                    <CardTitle className="text-xl font-semibold">{t("analysisResults")}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground">
                    <AnalysisDisplay analysis={analysis} />
                  </CardContent>
                </Card>
                <div className="flex flex-wrap justify-end gap-3 mt-6">
                  <Button onClick={handleDownloadImprovedCv} disabled={downloadingCv} className="rounded-full px-8 py-3 h-auto text-base font-medium">
                    {downloadingCv ? tCommon("loading") : t("downloadImprovedCv")}
                  </Button>
                  {/* PDF download commented out - DOCX only for now
                  <Button onClick={handleDownloadImprovedCvPdf} disabled={downloadingPdf} className="rounded-full px-8 py-3 h-auto text-base font-medium">
                    {downloadingPdf ? tCommon("loading") : "Download PDF"}
                  </Button>
                  */}
                  <Button variant="outline" onClick={handleStartOver} className="rounded-full px-8 py-3 h-auto text-base font-medium">
                    {t("startOver")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto flex flex-col items-center justify-center p-12">
                <p className="text-muted-foreground">{t("noResults")}</p>
              </div>
            )}

            {/* Next steps: Job recommendations + Interview quiz - side by side */}
            {(jobs.length > 0 || quizQuestions.length > 0) && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Next steps
                </h2>
                <div className={`grid gap-6 ${jobs.length > 0 && quizQuestions.length > 0 ? "lg:grid-cols-2" : ""}`}>
                  {/* Job recommendations */}
                  {jobs.length > 0 && (
                    <Card className="backdrop-blur-sm overflow-hidden">
                      <CardHeader className="border-b border-border py-4">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-violet-500" /> {t("recommendedJobs")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 max-h-[420px] overflow-y-auto">
                        <ul className="space-y-3">
                          {jobs.map((job, i) => (
                            <li key={i} className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                              <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-medium text-foreground text-sm truncate">{job.title}</h4>
                                    {job.source && (
                                      <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                                        {job.source}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">{job.company}</p>
                                  {job.location && <p className="text-xs text-muted-foreground">{job.location}</p>}
                                  {job.snippet && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{job.snippet}</p>}
                                </div>
                                <a href={job.link} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-full p-2 bg-primary text-primary-foreground hover:opacity-90" aria-label={tCommon("open")}>
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Interview quiz */}
                  {quizQuestions.length > 0 && (
                    <Card className="backdrop-blur-sm overflow-hidden">
                      <CardHeader className="border-b border-border py-4">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-cyan-500" /> {t("interviewPrep")}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{t("interviewPrepNote")}</p>
                      </CardHeader>
                      <CardContent className="p-4 max-h-[420px] overflow-y-auto space-y-4">
                        {quizQuestions.map((q, i) => (
                          <div key={i} className="space-y-2">
                            <p className="font-medium text-foreground text-sm">{i + 1}. {q.question}</p>
                            <div className="space-y-1.5 pl-1">
                              {(["A", "B", "C", "D"] as const).map((key) => (
                                <label
                                  key={key}
                                  className={`flex items-start gap-2 rounded-lg border p-2.5 cursor-pointer transition-colors text-sm ${
                                    quizAnswers[i] === key ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"
                                  } ${quizSubmitted ? (q.correct === key ? "ring-2 ring-green-500" : quizAnswers[i] === key && q.correct !== key ? "ring-2 ring-red-500" : "") : ""}`}
                                >
                                  <input type="radio" name={`quiz-${i}`} checked={quizAnswers[i] === key} onChange={() => !quizSubmitted && setQuizAnswers((prev) => ({ ...prev, [i]: key }))} className="mt-0.5" />
                                  <span>{q.options[key]}</span>
                                </label>
                              ))}
                            </div>
                            {quizSubmitted && <p className="text-xs text-muted-foreground pl-2 border-l-2 border-muted">{q.explanation}</p>}
                          </div>
                        ))}
                        {!quizSubmitted ? (
                          <Button onClick={handleQuizSubmit} className="rounded-lg px-6 py-2.5 h-auto text-sm font-medium">{t("submit")}</Button>
                        ) : (
                          <p className="font-medium text-foreground text-sm">Score: {quizScore} / {quizQuestions.length}</p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* PDF template modal commented out - DOCX only for now
      {cvTemplatesOpen && cvSections && (() => {
        const cvData = mapSectionsToCVData(cvSections);
        const SelectedComponent = selectedTemplateId ? TEMPLATE_MAP[selectedTemplateId] : null;
        return (
          <>
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-card border border-border rounded-2xl shadow-xl max-w-3xl w-full mx-4 p-6 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Choose a resume template</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your content is ready. Pick a layout style for your PDF.
                    </p>
                  </div>
                  <button
                    onClick={() => setCvTemplatesOpen(false)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Close
                  </button>
                </div>

                {cvTemplatesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>{tCommon("loading")}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <TemplateSelector
                      selected={selectedTemplateId || "classic"}
                      onSelect={(id) => setSelectedTemplateId(id)}
                      data={cvData}
                    />

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-muted-foreground">
                        Preview shows your actual resume data in each template.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setCvTemplatesOpen(false)}
                          className="rounded-full px-5 py-2 h-auto text-sm"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleConfirmTemplateDownload}
                          disabled={!selectedTemplateId || downloadingPdf}
                          className="rounded-full px-6 py-2 h-auto text-sm"
                        >
                          {downloadingPdf ? tCommon("loading") : "Download PDF"}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {typeof document !== "undefined" &&
              createPortal(
                <div
                  ref={pdfRenderRef}
                  style={{
                    position: "fixed",
                    left: "-9999px",
                    top: 0,
                    width: 794,
                    background: "#fff",
                    zIndex: -1,
                  }}
                >
                  {SelectedComponent && <SelectedComponent data={cvData} />}
                </div>,
                document.body,
              )}
          </>
        );
      })()}
      */}

      <Analytics />
    </div>
  );
}

function AnalysisDisplay({ analysis }: { analysis: string }) {
  const fg = "var(--foreground)";
  const accent = "var(--success)";
  const processedAnalysis = analysis
    .replace(/^# (.*$)/gm, `<div class="text-2xl font-bold mb-4" style="color:${fg}">$1</div>`)
    .replace(/^## (.*$)/gm, `<div class="text-xl font-semibold mb-2" style="color:${fg}">$1</div>`)
    .replace(/^### (.*$)/gm, `<div class="text-lg font-medium mt-6 mb-3" style="color:${fg}">$1</div>`)
    .replace(/^- (.*$)/gm, `<div class="flex items-start mb-2"><div class="w-1.5 h-1.5 rounded-full mt-2 mr-2 flex-shrink-0" style="background:${accent}"></div><p style="color:${fg}">$1</p></div>`)
    .replace(/^(\d+)\. (.*$)/gm, `<div class="flex items-start mb-3"><div class="w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0" style="background:${accent};color:${fg}"><span class="text-xs font-medium">$1</span></div><p style="color:${fg}">$2</p></div>`)
    .replace(/\*\*(.*?)\*\*/g, `<span class="font-semibold" style="color:${accent}">$1</span>`)
    .replace(/(✅|⚠️|❌|🌟|🔍|🛠️|📊|🔑|✏️|📁|🖋️|🎯)/g, '<span class="text-xl mr-1">$1</span>');
  const paragraphs = processedAnalysis.split("\n\n");
  return (
    <div className="analysis-container">
      {paragraphs.map((paragraph, index) => (
        <div key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\n/g, "<br/>") }} />
      ))}
    </div>
  );
}
