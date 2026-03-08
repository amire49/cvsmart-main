import React from "react";
import type { CVData } from "./types";

interface Props {
  data: CVData;
}

export function TemplateClassic({ data }: Props) {
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
      className="flex min-h-[700px] font-[Open_Sans]"
      style={{ fontSize: 13 }}
    >
      {/* Left profile column */}
      <div className="w-[40%] bg-white p-8 text-gray-800">
        <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900 mb-0.5">
          {name}
        </h1>
        {personal.title && (
          <p className="text-[#66cc99] text-xs font-medium mb-3">{personal.title}</p>
        )}

        {hasContact && (
          <div className="mt-3 space-y-1 text-xs text-gray-500">
            {personal.email && <p>{personal.email}</p>}
            {personal.phone && <p>{personal.phone}</p>}
            {personal.location && <p>{personal.location}</p>}
            {personal.website && <p>{personal.website}</p>}
            {personal.linkedin && <p>{personal.linkedin}</p>}
            {personal.github && <p>{personal.github}</p>}
          </div>
        )}

        {data.summary && (
          <div className="mt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Summary
            </h2>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
              {data.summary}
            </p>
          </div>
        )}

        {data.education.some((e) => e.degree || e.school) && (
          <div className="mt-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Education
            </h2>
            {data.education.map(
              (edu, i) =>
                (edu.degree || edu.school) && (
                  <div key={i} className="mb-2">
                    <p className="font-semibold text-gray-800">{edu.degree}</p>
                    <p className="text-gray-500 text-xs">
                      {edu.school}
                      {edu.year && ` — ${edu.year}`}
                    </p>
                  </div>
                )
            )}
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="mt-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Skills
            </h2>
            <ul className="space-y-1">
              {data.skills.map((skill, i) => (
                <li key={i} className="text-gray-600">
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Right experience column */}
      <div className="w-[60%] bg-[#3d3e42] text-[#9099a0] p-8">
        {data.experience.some((e) => e.role || e.company) && (
          <div>
            <h2 className="text-white text-sm font-semibold uppercase tracking-wider mb-3">
              Experience
            </h2>
            {data.experience.map(
              (exp, i) =>
                (exp.role || exp.company) && (
                  <div key={i} className="mb-4">
                    <p className="text-white font-semibold">{exp.role}</p>
                    <p className="text-[#66cc99] text-xs mb-1">
                      {exp.company}
                      {exp.dates && ` | ${exp.dates}`}
                    </p>
                    {exp.bullets.length > 0 && (
                      <ul className="list-disc list-inside space-y-0.5 text-xs">
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
          <div className="mt-5">
            <h2 className="text-white text-sm font-semibold uppercase tracking-wider mb-3">
              Projects
            </h2>
            {data.projects.map(
              (proj, i) =>
                (proj.title || proj.description) && (
                  <div key={i} className="mb-3">
                    <p className="text-white font-semibold">{proj.title}</p>
                    {proj.description && (
                      <p className="text-xs mt-0.5">{proj.description}</p>
                    )}
                  </div>
                )
            )}
          </div>
        )}

        {!hasContent && (
          <p className="italic text-[#9099a0]">
            Fill in the form to see your CV here.
          </p>
        )}
      </div>
    </div>
  );
}
