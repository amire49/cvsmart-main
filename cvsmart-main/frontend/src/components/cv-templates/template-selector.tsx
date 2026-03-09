import React from "react";
import { TemplateClassic } from "./template-classic";
import { TemplateModern } from "./template-modern";
import { TemplateMinimal } from "./template-minimal";
import type { CVData } from "./types";
import { Check } from "lucide-react";

export type TemplateId = "classic" | "modern" | "minimal";

interface Template {
  id: TemplateId;
  name: string;
  description: string;
}

const TEMPLATES: Template[] = [
  { id: "classic", name: "Classic", description: "Split two-column layout" },
  { id: "modern", name: "Modern", description: "Warm sidebar design" },
  { id: "minimal", name: "Minimal", description: "Header with grid" },
];

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
  summary: "Experienced professional with a strong background in engineering.",
  experience: [
    {
      role: "Software Engineer",
      company: "TechCorp",
      dates: "2022 – Present",
      bullets: ["Built scalable APIs", "Led a team of 5"],
    },
  ],
  education: [
    { degree: "B.Sc. Computer Science", school: "University", year: "2021" },
  ],
  skills: ["React", "Python", "Node.js"],
  projects: [
    { title: "Portfolio Site", description: "Personal website built with Next.js" },
  ],
};

const templateComponents: Record<
  TemplateId,
  React.ComponentType<{ data: CVData }>
> = {
  classic: TemplateClassic,
  modern: TemplateModern,
  minimal: TemplateMinimal,
};

interface Props {
  selected: TemplateId;
  onSelect: (id: TemplateId) => void;
  data?: CVData;
}

export function TemplateSelector({ selected, onSelect, data }: Props) {
  const previewData = data || sampleData;

  return (
    <div className="grid grid-cols-3 gap-4">
      {TEMPLATES.map((tpl) => {
        const Component = templateComponents[tpl.id];
        const isActive = selected === tpl.id;

        return (
          <button
            key={tpl.id}
            type="button"
            onClick={() => onSelect(tpl.id)}
            className={`relative group rounded-lg border-2 overflow-hidden transition-all text-left ${
              isActive
                ? "border-primary ring-2 ring-primary/30"
                : "border-border hover:border-primary/50"
            }`}
          >
            {/* Miniature preview */}
            <div className="relative h-44 overflow-hidden bg-gray-100">
              <div
                className="origin-top-left pointer-events-none"
                style={{
                  transform: "scale(0.28)",
                  width: "357%",
                  height: "357%",
                }}
              >
                <Component data={previewData} />
              </div>
            </div>

            {/* Label */}
            <div className="p-2 bg-background border-t border-border">
              <p className="text-sm font-medium text-foreground">{tpl.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {tpl.description}
              </p>
            </div>

            {/* Selected badge */}
            {isActive && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
