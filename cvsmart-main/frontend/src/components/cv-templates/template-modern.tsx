import React from "react";
import type { CVData } from "./types";

interface Props {
  data: CVData;
}

export function TemplateModern({ data }: Props) {
  const { personal } = data;
  const name = personal.fullName || "Your Name";
  const hasContact = personal.email || personal.phone || personal.location || personal.website || personal.linkedin || personal.github;

  const hasContent =
    personal.fullName ||
    data.summary ||
    data.experience.some((e) => e.role || e.company) ||
    data.education.some((e) => e.degree || e.school) ||
    data.skills.length > 0 ||
    data.projects.some((p) => p.title || p.description);

  return (
    <div
      className="flex min-h-[700px] bg-white shadow-xl font-[Open_Sans]"
      style={{ fontSize: 13 }}
    >
      {/* Sidebar */}
      <div className="w-[280px] bg-[#F7E0C1] p-7 flex-shrink-0">
        <h2 className="text-lg font-bold text-gray-900 mb-0.5">{name}</h2>
        {personal.title && (
          <p className="text-xs text-gray-600 mb-4">{personal.title}</p>
        )}

        {hasContact && (
          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 border-b border-gray-400/40 pb-1">
              Contact
            </h3>
            <div className="space-y-1 text-[11px] text-gray-700 mt-1.5">
              {personal.email && <p>{personal.email}</p>}
              {personal.phone && <p>{personal.phone}</p>}
              {personal.location && <p>{personal.location}</p>}
              {personal.website && <p>{personal.website}</p>}
              {personal.linkedin && <p>{personal.linkedin}</p>}
              {personal.github && <p>{personal.github}</p>}
            </div>
          </div>
        )}

        {data.summary && (
          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 border-b border-gray-400/40 pb-1">
              About Me
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-xs">
              {data.summary}
            </p>
          </div>
        )}

        {data.education.some((e) => e.degree || e.school) && (
          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 border-b border-gray-400/40 pb-1">
              Education
            </h3>
            {data.education.map(
              (edu, i) =>
                (edu.degree || edu.school) && (
                  <div key={i} className="mb-2">
                    <p className="font-semibold text-gray-800 text-xs">
                      {edu.degree}
                    </p>
                    <p className="text-gray-600 text-[11px]">
                      {edu.school}
                      {edu.year && ` — ${edu.year}`}
                    </p>
                  </div>
                )
            )}
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 border-b border-gray-400/40 pb-1">
              Skills
            </h3>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {data.skills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-white/60 text-gray-800 px-2 py-0.5 rounded text-[11px]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        {data.experience.some((e) => e.role || e.company) && (
          <div className="mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-3 border-b-2 border-[#F7E0C1] pb-1">
              Experience
            </h2>
            {data.experience.map(
              (exp, i) =>
                (exp.role || exp.company) && (
                  <div key={i} className="mb-4">
                    <div className="flex justify-between items-baseline">
                      <p className="font-semibold text-gray-900">{exp.role}</p>
                      {exp.dates && (
                        <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">
                          {exp.dates}
                        </span>
                      )}
                    </div>
                    <p className="text-[#c0884d] text-xs mb-1">{exp.company}</p>
                    {exp.bullets.length > 0 && (
                      <ul className="list-disc list-inside space-y-0.5 text-gray-600 text-xs">
                        {exp.bullets.map((b, j) => (
                          <li key={j}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
            )}
          </div>
        )}

        {data.projects.some((p) => p.title || p.description) && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-3 border-b-2 border-[#F7E0C1] pb-1">
              Projects
            </h2>
            {data.projects.map(
              (proj, i) =>
                (proj.title || proj.description) && (
                  <div key={i} className="mb-3">
                    <p className="font-semibold text-gray-900">{proj.title}</p>
                    {proj.description && (
                      <p className="text-gray-600 text-xs mt-0.5">
                        {proj.description}
                      </p>
                    )}
                  </div>
                )
            )}
          </div>
        )}

        {!hasContent && (
          <p className="italic text-gray-400">
            Fill in the form to see your CV here.
          </p>
        )}
      </div>
    </div>
  );
}
