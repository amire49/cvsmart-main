"use client";

import React, { useState, type ChangeEvent } from "react";
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
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Analytics } from "@vercel/analytics/next";

interface AnalysisResponse {
  analysis: string;
}

const MAX_FILE_SIZE_MB = 10; // Maximum file size in MB

const STEPS = [
  { id: 1 as const, label: "Upload CV" },
  { id: 2 as const, label: "Job description" },
  { id: 3 as const, label: "View results" },
];

function StepProgressBar({
  currentStep,
  completedThrough,
}: {
  currentStep: 1 | 2 | 3;
  completedThrough: number;
}) {
  // Fill width: 2 segments between 3 circles -> 50% per completed step
  const fillPercent = (completedThrough / 2) * 100;
  return (
    <nav
      aria-label={`Step ${currentStep} of 3: ${STEPS[currentStep - 1].label}`}
      className="relative z-10 w-full max-w-2xl mx-auto"
    >
      <div className="absolute left-0 right-0 top-5 h-0.5 -translate-y-1/2 bg-muted" />
      <div
        className="absolute left-0 top-5 h-0.5 -translate-y-1/2 bg-success transition-all duration-300"
        style={{ width: `${fillPercent}%` }}
      />
      <ol className="relative flex items-start justify-between" role="list">
        {STEPS.map((step) => {
          const isCompleted = completedThrough >= step.id;
          const isActive = currentStep === step.id;
          return (
            <li
              key={step.id}
              className="flex flex-1 flex-col items-center"
              aria-current={isActive ? "step" : undefined}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  isCompleted
                    ? "border-transparent bg-success text-success-foreground"
                    : isActive
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-border bg-transparent text-muted-foreground"
                }`}
              >
                {isCompleted && !isActive ? (
                  <Check className="h-5 w-5" aria-hidden />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </div>
              <span
                className={`mt-2 text-sm font-medium ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default function ResumeAnalyzer() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const completedThrough =
    currentStep === 3 ? 2 : currentStep === 2 ? 1 : 0;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const fileSizeMB = selectedFile.size / (1024 * 1024);

      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        toast.error(`Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
        setFile(null);
      } else if (
        ![
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(selectedFile.type)
      ) {
        toast.error("Only PDF and DOCX are allowed.");
        setFile(null);
      } else {
        setFile(selectedFile);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file || !jobDescription.trim()) {
      toast.error("Please upload a resume and provide a job description.");
      return;
    }

    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    try {
      const response = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        body: formData,
      });

      const data: AnalysisResponse = await response.json();
      setAnalysis(data.analysis);
      setCurrentStep(3);
      toast.success("Analysis complete");
    } catch (err) {
      console.error("Error during analysis:", err);
      toast.error("Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setAnalysis("");
    setFile(null);
    setJobDescription("");
  };

  return (
    <div className="app-page min-h-screen bg-background text-foreground overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-success rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-ring rounded-full filter blur-[150px] opacity-10" />
      </div>

      {/* Header */}
      <header className="relative z-10 py-12 px-4 border-b border-border backdrop-blur-md">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center tracking-tight font-sans">
            Resume <span className="text-display font-serif italic">Analyzer</span>
          </h1>
          <p className="text-center mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Upload your resume and job description to get AI-powered insights
            and recommendations
          </p>
        </div>
      </header>

      {/* Step Progress Bar */}
      <div className="relative z-10 container mx-auto max-w-6xl px-4 pt-8">
        <StepProgressBar
          currentStep={currentStep}
          completedThrough={completedThrough}
        />
      </div>

      {/* Main Content - Step-based */}
      <main className="relative z-10 container mx-auto max-w-6xl p-6 md:p-8 pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Upload CV */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card className="backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-xl font-semibold">
                    Upload Resume
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-48 border border-dashed border-border rounded-xl cursor-pointer bg-muted hover:bg-accent transition-all duration-300">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {file ? (
                          <>
                            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mb-4">
                              <FileText className="w-8 h-8 text-primary-foreground" />
                            </div>
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">
                                {file.name}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Click to change file
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 border border-border">
                              <Upload className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PDF or DOCX (MAX. 10MB)
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-end">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!file}
                  className="rounded-full px-8 py-6 h-auto text-lg font-medium"
                >
                  Next <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Job description */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <p className="text-foreground text-center md:text-left">
                Paste the job description you want to match your CV against.
              </p>
              <Card className="backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-xl font-semibold">
                    Job Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Textarea
                    placeholder="Paste the job description here..."
                    className="min-h-[200px] bg-muted border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-ring resize-none"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </CardContent>
              </Card>
              {loading && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2 bg-muted" />
                  <p className="text-xs text-muted-foreground text-center">
                    {progress < 100
                      ? "Analyzing your resume..."
                      : "Analysis complete!"}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  disabled={loading}
                  className="rounded-full px-6 py-6 h-auto"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={loading || !file || !jobDescription.trim()}
                  className="rounded-full px-8 py-6 h-auto text-lg font-medium"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2">
                        <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                      </div>
                      Analyzing
                    </div>
                  ) : (
                    <>
                      Analyze <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Analysis result */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Card className="backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-xl font-semibold">
                    Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="min-h-[400px] max-h-[600px] overflow-y-auto">
                    {analysis ? (
                      <div className="p-6 prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground">
                        <AnalysisDisplay analysis={analysis} />
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-6 min-h-[400px]">
                        <p className="text-muted-foreground text-center">
                          No results to display.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={handleStartOver}
                  className="rounded-full px-8 py-6 h-auto text-lg font-medium"
                >
                  Start over
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border pt-16 pb-8">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">CVSmart</span>
            </div>
            <div className="flex space-x-8">
              {[
                {
                  name: "Twitter",
                  href: "https://twitter.com",
                  icon: <Twitter className="w-5 h-5 text-muted-foreground" />,
                },
                {
                  name: "Facebook",
                  href: "https://facebook.com",
                  icon: <Facebook className="w-5 h-5 text-muted-foreground" />,
                },
                {
                  name: "Instagram",
                  href: "https://instagram.com",
                  icon: <Instagram className="w-5 h-5 text-muted-foreground" />,
                },
                {
                  name: "LinkedIn",
                  href: "https://linkedin.com",
                  icon: <Linkedin className="w-5 h-5 text-muted-foreground" />,
                },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <span className="sr-only">{social.name}</span>
                  {social.icon}
                </a>
              ))}
            </div>
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} CVSmart. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      <Analytics />
    </div>
  );
}
function AnalysisDisplay({ analysis }: { analysis: string }) {
  const fg = "var(--foreground)";
  const accent = "var(--success)";
  const muted = "var(--muted-foreground)";
  const processedAnalysis = analysis
    .replace(
      /^# (.*$)/gm,
      `<div class="text-2xl font-bold mb-4" style="color:${fg}">$1</div>`
    )
    .replace(
      /^## (.*$)/gm,
      `<div class="text-xl font-semibold mb-2" style="color:${fg}">$1</div>`
    )
    .replace(
      /^### (.*$)/gm,
      `<div class="text-lg font-medium mt-6 mb-3" style="color:${fg}">$1</div>`
    )
    .replace(
      /^- (.*$)/gm,
      `<div class="flex items-start mb-2"><div class="w-1.5 h-1.5 rounded-full mt-2 mr-2 flex-shrink-0" style="background:${accent}"></div><p style="color:${fg}">$1</p></div>`
    )
    .replace(
      /^(\d+)\. (.*$)/gm,
      `<div class="flex items-start mb-3"><div class="w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0" style="background:${accent};color:${fg}"><span class="text-xs font-medium">$1</span></div><p style="color:${fg}">$2</p></div>`
    )
    .replace(
      /\*\*(.*?)\*\*/g,
      `<span class="font-semibold" style="color:${accent}">$1</span>`
    )
    .replace(
      /(✅|⚠️|❌|🌟|🔍|🛠️|📊|🔑|✏️|📁|🖋️|🎯)/g,
      '<span class="text-xl mr-1">$1</span>'
    );

  const paragraphs = processedAnalysis.split("\n\n");

  return (
    <div className="analysis-container">
      {paragraphs.map((paragraph, index) => (
        <div
          key={index}
          className="mb-4"
          dangerouslySetInnerHTML={{
            __html: paragraph.replace(/\n/g, "<br/>"),
          }}
        />
      ))}
    </div>
  );
}
