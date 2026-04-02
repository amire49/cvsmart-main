"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  FileDown,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Check,
  User,
  Loader2,
  Eye,
  PenLine,
} from "lucide-react";
import { toast } from "sonner";
import { exportElementToPdf } from "@/lib/pdf-export";
import {
  TEMPLATE_MAP,
  type TemplateId,
  type CVData,
} from "@/components/cv-templates";
import { TemplateClassic } from "@/components/cv-templates/template-classic";
import { TemplateModern } from "@/components/cv-templates/template-modern";
import { TemplateMinimal } from "@/components/cv-templates/template-minimal";

interface ExperienceEntry {
  role: string;
  company: string;
  dates: string;
  bullets: string;
}

interface EducationEntry {
  degree: string;
  school: string;
  year: string;
}

interface ProjectEntry {
  title: string;
  description: string;
}

const defaultExperience: ExperienceEntry = { role: "", company: "", dates: "", bullets: "" };
const defaultEducation: EducationEntry = { degree: "", school: "", year: "" };
const defaultProject: ProjectEntry = { title: "", description: "" };

const sampleData: CVData = {
  personal: {
    fullName: "John Doe",
    title: "Software Engineer",
    email: "john@email.com",
    phone: "+1 234 567 890",
    location: "San Francisco, CA",
    website: "",
    linkedin: "",
    github: "",
  },
  summary: "Experienced professional with a strong background in software engineering and team leadership.",
  experience: [
    { role: "Software Engineer", company: "TechCorp", dates: "2022 – Present", bullets: ["Built scalable APIs", "Led a team of 5"] },
  ],
  education: [
    { degree: "B.Sc. Computer Science", school: "University", year: "2021" },
  ],
  skills: ["React", "Python", "Node.js"],
  projects: [
    { title: "Portfolio Site", description: "Personal website built with Next.js" },
  ],
};

const TEMPLATES: { id: TemplateId; name: string }[] = [
  { id: "classic", name: "Classic" },
  { id: "modern", name: "Modern" },
  { id: "minimal", name: "Minimal" },
];

const templateComponents: Record<TemplateId, React.ComponentType<{ data: CVData }>> = {
  classic: TemplateClassic,
  modern: TemplateModern,
  minimal: TemplateMinimal,
};

type SectionKey = "personal" | "summary" | "experience" | "education" | "skills" | "projects";

const SECTION_META: { key: SectionKey; label: string; icon: React.ReactNode }[] = [
  { key: "personal", label: "Personal Info", icon: <User className="w-4 h-4" /> },
  { key: "summary", label: "Summary", icon: <FileText className="w-4 h-4" /> },
  { key: "experience", label: "Experience", icon: <Briefcase className="w-4 h-4" /> },
  { key: "education", label: "Education", icon: <GraduationCap className="w-4 h-4" /> },
  { key: "skills", label: "Skills", icon: <Wrench className="w-4 h-4" /> },
  { key: "projects", label: "Projects", icon: <FolderOpen className="w-4 h-4" /> },
];

export default function BuildCvPage() {
  const t = useTranslations("nav");
  const supabase = createClientComponentClient();

  const [loading, setLoading] = useState(true);
  const [templateId, setTemplateId] = useState<TemplateId>("classic");

  // Personal info
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");

  // CV sections
  const [summary, setSummary] = useState("");
  const [experience, setExperience] = useState<ExperienceEntry[]>([{ ...defaultExperience }]);
  const [education, setEducation] = useState<EducationEntry[]>([{ ...defaultEducation }]);
  const [skills, setSkills] = useState("");
  const [projects, setProjects] = useState<ProjectEntry[]>([{ ...defaultProject }]);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewWrapperRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    personal: true,
    summary: true,
    experience: true,
    education: true,
    skills: true,
    projects: true,
  });

  // Fetch profile from Supabase on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (profile) {
          if (profile.full_name) setFullName(profile.full_name);
          if (profile.title && profile.title !== "Professional Title") setTitle(profile.title);
          if (profile.email || user.email) setEmail(profile.email || user.email || "");
          if (profile.phone) setPhone(profile.phone);
          if (profile.location && profile.location !== "City, Country") setLocation(profile.location);
          if (profile.website) setWebsite(profile.website);
          if (profile.linkedin) setLinkedin(profile.linkedin);
          if (profile.github) setGithub(profile.github);
          if (profile.bio) setSummary(profile.bio);

          // Pre-fill skills
          if (profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0) {
            setSkills(profile.skills.join(", "));
          }

          // Pre-fill education
          if (profile.education && Array.isArray(profile.education) && profile.education.length > 0) {
            setEducation(
              profile.education.map((edu: { degree?: string; institution?: string; year?: string }) => ({
                degree: edu.degree || "",
                school: edu.institution || "",
                year: edu.year || "",
              }))
            );
          }

          // Pre-fill experience
          if (profile.experience && Array.isArray(profile.experience) && profile.experience.length > 0) {
            setExperience(
              profile.experience.map((exp: { position?: string; company?: string; duration?: string; description?: string }) => ({
                role: exp.position || "",
                company: exp.company || "",
                dates: exp.duration || "",
                bullets: exp.description || "",
              }))
            );
          }
        } else if (user.email) {
          setEmail(user.email);
        }
      } catch {
        // Profile fetch failed silently -- user can still fill manually
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [supabase]);

  const toggleSection = (key: SectionKey) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const addExperience = () => setExperience((prev) => [...prev, { ...defaultExperience }]);
  const removeExperience = (i: number) => setExperience((prev) => prev.filter((_, j) => j !== i));
  const addEducation = () => setEducation((prev) => [...prev, { ...defaultEducation }]);
  const removeEducation = (i: number) => setEducation((prev) => prev.filter((_, j) => j !== i));
  const addProject = () => setProjects((prev) => [...prev, { ...defaultProject }]);
  const removeProject = (i: number) => setProjects((prev) => prev.filter((_, j) => j !== i));

  const updateExperience = (i: number, field: keyof ExperienceEntry, value: string) => {
    setExperience((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };
  const updateEducation = (i: number, field: keyof EducationEntry, value: string) => {
    setEducation((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };
  const updateProject = (i: number, field: keyof ProjectEntry, value: string) => {
    setProjects((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const parsedExperience = experience.map((e) => ({
    role: e.role,
    company: e.company,
    dates: e.dates,
    bullets: e.bullets ? e.bullets.split("\n").filter(Boolean) : [],
  }));
  const parsedSkills = skills ? skills.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const previewData: CVData = {
    personal: { fullName, title, email, phone, location, website, linkedin, github },
    summary,
    experience: parsedExperience,
    education: education.map((e) => ({ degree: e.degree, school: e.school, year: e.year })),
    skills: parsedSkills,
    projects: projects.map((p) => ({ title: p.title, description: p.description })),
  };

  const handleDownloadPdf = async () => {
    const container = previewContainerRef.current;
    if (!container) {
      toast.error("Preview not ready");
      return;
    }
    setDownloadingPdf(true);
    try {
      await exportElementToPdf({ element: container, filename: "my_cv.pdf" });
      toast.success("Download started");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Failed to create PDF");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const PreviewComponent = TEMPLATE_MAP[templateId];

  const updatePreviewScale = useCallback(() => {
    const wrapper = previewWrapperRef.current;
    if (!wrapper) return;
    const available = wrapper.clientWidth - 32;
    const cvWidth = 680;
    setPreviewScale(available < cvWidth ? available / cvWidth : 1);
  }, []);

  useEffect(() => {
    updatePreviewScale();
    window.addEventListener("resize", updatePreviewScale);
    return () => window.removeEventListener("resize", updatePreviewScale);
  }, [updatePreviewScale]);

  useEffect(() => {
    if (mobileTab === "preview") {
      requestAnimationFrame(updatePreviewScale);
    }
  }, [mobileTab, updatePreviewScale]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: "calc(100vh - 60px)" }}>
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const formPanel = (
    <div className="flex flex-col overflow-hidden bg-background h-full">
      {/* Panel header */}
      <div className="px-4 sm:px-5 py-3 border-b border-border flex items-center justify-between gap-2 shrink-0">
        <h1 className="text-lg font-bold truncate">{t("buildCv")}</h1>
        <Button
          size="sm"
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
          className="rounded-full gap-2 shrink-0"
        >
          {downloadingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          <span className="hidden xs:inline">{downloadingPdf ? "Creating PDF…" : "PDF"}</span>
        </Button>
      </div>

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto">
        {/* Template picker */}
        <div className="px-4 sm:px-5 py-4 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Template
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {TEMPLATES.map((tpl) => {
              const Comp = templateComponents[tpl.id];
              const isActive = templateId === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setTemplateId(tpl.id)}
                  className={`relative rounded-lg border-2 overflow-hidden text-left cursor-pointer transition-all ${
                    isActive ? "border-primary shadow-[0_0_0_3px_rgba(var(--primary),0.15)]" : "border-border"
                  }`}
                >
                  <div className="h-20 overflow-hidden relative bg-muted/30">
                    <div style={{ transform: "scale(0.16)", transformOrigin: "top left", width: "625%", height: "625%", pointerEvents: "none" }}>
                      <Comp data={sampleData} />
                    </div>
                  </div>
                  <div className="bg-background border-t border-border px-2 py-1 flex items-center justify-between">
                    <span className="text-[11px] font-medium">{tpl.name}</span>
                    {isActive && (
                      <div className="bg-primary w-4 h-4 rounded-full flex items-center justify-center">
                        <Check className="text-primary-foreground w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form sections */}
        <div className="divide-y divide-border">
          <CollapsibleSection
            icon={SECTION_META[0].icon}
            label={SECTION_META[0].label}
            open={openSections.personal}
            onToggle={() => toggleSection("personal")}
          >
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="text-sm" />
                <Input placeholder="Job title" value={title} onChange={(e) => setTitle(e.target.value)} className="text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="text-sm" />
                <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="text-sm" />
              </div>
              <Input placeholder="Location (e.g. Addis Ababa, Ethiopia)" value={location} onChange={(e) => setLocation(e.target.value)} className="text-sm" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input placeholder="Website (optional)" value={website} onChange={(e) => setWebsite(e.target.value)} className="text-sm" />
                <Input placeholder="LinkedIn (optional)" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="text-sm" />
              </div>
              <Input placeholder="GitHub (optional)" value={github} onChange={(e) => setGithub(e.target.value)} className="text-sm" />
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            icon={SECTION_META[1].icon}
            label={SECTION_META[1].label}
            open={openSections.summary}
            onToggle={() => toggleSection("summary")}
          >
            <Textarea
              placeholder="A brief professional summary..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="min-h-[90px] text-sm"
            />
          </CollapsibleSection>

          <CollapsibleSection
            icon={SECTION_META[2].icon}
            label={SECTION_META[2].label}
            open={openSections.experience}
            onToggle={() => toggleSection("experience")}
            onAdd={addExperience}
          >
            <div className="space-y-3">
              {experience.map((exp, i) => (
                <div key={i} className="rounded-lg border border-border p-3 space-y-2 relative">
                  <button onClick={() => removeExperience(i)} className="text-muted-foreground hover:text-destructive absolute top-2 right-2">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <Input placeholder="Job title" value={exp.role} onChange={(e) => updateExperience(i, "role", e.target.value)} className="text-sm" />
                  <Input placeholder="Company" value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} className="text-sm" />
                  <Input placeholder="Dates (e.g. 2022 – Present)" value={exp.dates} onChange={(e) => updateExperience(i, "dates", e.target.value)} className="text-sm" />
                  <Textarea placeholder="Key achievements (one per line)" value={exp.bullets} onChange={(e) => updateExperience(i, "bullets", e.target.value)} className="min-h-[60px] text-sm" />
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            icon={SECTION_META[3].icon}
            label={SECTION_META[3].label}
            open={openSections.education}
            onToggle={() => toggleSection("education")}
            onAdd={addEducation}
          >
            <div className="space-y-3">
              {education.map((edu, i) => (
                <div key={i} className="rounded-lg border border-border p-3 space-y-2 relative">
                  <button onClick={() => removeEducation(i)} className="text-muted-foreground hover:text-destructive absolute top-2 right-2">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <Input placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} className="text-sm" />
                  <Input placeholder="School" value={edu.school} onChange={(e) => updateEducation(i, "school", e.target.value)} className="text-sm" />
                  <Input placeholder="Year" value={edu.year} onChange={(e) => updateEducation(i, "year", e.target.value)} className="text-sm" />
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            icon={SECTION_META[4].icon}
            label={SECTION_META[4].label}
            open={openSections.skills}
            onToggle={() => toggleSection("skills")}
          >
            <Input
              placeholder="React, Python, Node.js, ..."
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="text-sm"
            />
          </CollapsibleSection>

          <CollapsibleSection
            icon={SECTION_META[5].icon}
            label={SECTION_META[5].label}
            open={openSections.projects}
            onToggle={() => toggleSection("projects")}
            onAdd={addProject}
          >
            <div className="space-y-3">
              {projects.map((proj, i) => (
                <div key={i} className="rounded-lg border border-border p-3 space-y-2 relative">
                  <button onClick={() => removeProject(i)} className="text-muted-foreground hover:text-destructive absolute top-2 right-2">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <Input placeholder="Project name" value={proj.title} onChange={(e) => updateProject(i, "title", e.target.value)} className="text-sm" />
                  <Textarea placeholder="Description" value={proj.description} onChange={(e) => updateProject(i, "description", e.target.value)} className="min-h-[50px] text-sm" />
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );

  const previewPanel = (
    <div
      ref={previewWrapperRef}
      className="flex-1 overflow-auto flex items-start justify-center p-4 md:p-8 bg-muted/50"
    >
      <div
        ref={previewContainerRef}
        style={{
          width: 680,
          minHeight: 960,
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          borderRadius: 2,
          transformOrigin: "top center",
          transform: previewScale < 1 ? `scale(${previewScale})` : undefined,
        }}
      >
        <PreviewComponent data={previewData} />
      </div>
    </div>
  );

  return (
    <>
      {/* ===== Desktop: side-by-side ===== */}
      <div className="hidden md:grid md:grid-cols-[420px_1fr]" style={{ height: "calc(100vh - 60px)", overflow: "hidden" }}>
        <div className="border-r border-border overflow-hidden">
          {formPanel}
        </div>
        {previewPanel}
      </div>

      {/* ===== Mobile: tabbed ===== */}
      <div className="flex flex-col md:hidden" style={{ height: "calc(100vh - 60px)" }}>
        {/* Tab bar */}
        <div className="flex border-b border-border bg-background shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab("form")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              mobileTab === "form"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <PenLine className="h-4 w-4" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              mobileTab === "preview"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
        </div>

        {/* Active panel */}
        <div className="flex-1 overflow-hidden">
          {mobileTab === "form" ? formPanel : previewPanel}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Collapsible section                                                */
/* ------------------------------------------------------------------ */

function CollapsibleSection({
  icon,
  label,
  open,
  onToggle,
  onAdd,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  open: boolean;
  onToggle: () => void;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-5 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        {icon}
        <span className="flex-1 text-left">{label}</span>
        {onAdd && open && (
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            className="text-primary hover:text-primary/80 mr-1"
          >
            <Plus className="h-4 w-4" />
          </span>
        )}
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}
