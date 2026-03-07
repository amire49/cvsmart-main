import React from "react";
import type { CVData } from "./types";

interface Props {
  data: CVData;
}

export function TemplateMinimal({ data }: Props) {
  const hasContent =
    data.summary ||
    data.experience.some((e) => e.role || e.company) ||
    data.education.some((e) => e.degree || e.school) ||
    data.skills.length > 0 ||
    data.projects.some((p) => p.title || p.description);

  return (
    <div
      className="min-h-[700px] bg-white font-[Open_Sans]"
      style={{ fontSize: 13 }}
    >
      {/* Header */}
      <div className="bg-[#434E5E] text-white px-8 py-7">
        <h1 className="text-xl font-bold tracking-wide">Your Name</h1>
        <p className="text-gray-300 text-sm mt-1">Software Engineer</p>
        {data.summary && (
          <p className="text-gray-300 text-xs mt-3 leading-relaxed whitespace-pre-wrap max-w-[600px]">
            {data.summary}
          </p>
        )}
      </div>

      {/* Body: 75/25 grid */}
      <div className="flex">
        {/* Main column (75%) */}
        <div className="w-[75%] p-6">
          {data.experience.some((e) => e.role || e.company) && (
            <div className="mb-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#434E5E] mb-3 border-b-2 border-[#434E5E] pb-1">
                Experience
              </h2>
              {data.experience.map(
                (exp, i) =>
                  (exp.role || exp.company) && (
                    <div key={i} className="mb-4">
                      <div className="flex justify-between items-baseline">
                        <p className="font-semibold text-gray-900">
                          {exp.role}
                        </p>
                        {exp.dates && (
                          <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">
                            {exp.dates}
                          </span>
                        )}
                      </div>
                      <p className="text-[#58677c] text-xs mb-1">
                        {exp.company}
                      </p>
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
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#434E5E] mb-3 border-b-2 border-[#434E5E] pb-1">
                Projects
              </h2>
              {data.projects.map(
                (proj, i) =>
                  (proj.title || proj.description) && (
                    <div key={i} className="mb-3">
                      <p className="font-semibold text-gray-900">
                        {proj.title}
                      </p>
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

        {/* Side column (25%) */}
        <div className="w-[25%] p-6 bg-gray-50">
          {data.education.some((e) => e.degree || e.school) && (
            <div className="mb-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#434E5E] mb-2 border-b border-gray-300 pb-1">
                Education
              </h2>
              {data.education.map(
                (edu, i) =>
                  (edu.degree || edu.school) && (
                    <div key={i} className="mb-2">
                      <p className="font-semibold text-gray-800 text-xs">
                        {edu.degree}
                      </p>
                      <p className="text-gray-500 text-[11px]">
                        {edu.school}
                        {edu.year && ` — ${edu.year}`}
                      </p>
                    </div>
                  )
              )}
            </div>
          )}

          {data.skills.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#434E5E] mb-2 border-b border-gray-300 pb-1">
                Skills
              </h2>
              <div className="space-y-2">
                {data.skills.map((skill, i) => (
                  <div key={i}>
                    <p className="text-gray-700 text-xs mb-0.5">{skill}</p>
                    <div className="h-1.5 bg-gray-200 rounded-full">
                      <div
                        className="h-1.5 bg-[#58677c] rounded-full"
                        style={{ width: `${75 + ((i * 13) % 25)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
