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
      style={{ fontSize: 13, fontFamily: "'Open Sans', sans-serif", display: "flex", minHeight: 700, backgroundColor: "#ffffff" }}
    >
      {/* Left profile column */}
      <div style={{ width: "40%", backgroundColor: "#ffffff", padding: 32, color: "#1f2937" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#111827", marginBottom: 2 }}>
          {name}
        </h1>
        {personal.title && (
          <p style={{ color: "#66cc99", fontSize: "0.75rem", fontWeight: 500, marginBottom: 12 }}>{personal.title}</p>
        )}

        {hasContact && (
          <div style={{ marginTop: 12, color: "#6b7280", fontSize: "0.75rem" }}>
            {personal.email && <p style={{ marginBottom: 4 }}>{personal.email}</p>}
            {personal.phone && <p style={{ marginBottom: 4 }}>{personal.phone}</p>}
            {personal.location && <p style={{ marginBottom: 4 }}>{personal.location}</p>}
            {personal.website && <p style={{ marginBottom: 4 }}>{personal.website}</p>}
            {personal.linkedin && <p style={{ marginBottom: 4 }}>{personal.linkedin}</p>}
            {personal.github && <p style={{ marginBottom: 4 }}>{personal.github}</p>}
          </div>
        )}

        {data.summary && (
          <div style={{ marginTop: 16 }}>
            <h2 style={{ fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", marginBottom: 4 }}>
              Summary
            </h2>
            <p style={{ color: "#4b5563", whiteSpace: "pre-wrap", lineHeight: 1.625 }}>
              {data.summary}
            </p>
          </div>
        )}

        {data.education.some((e) => e.degree || e.school) && (
          <div style={{ marginTop: 20 }}>
            <h2 style={{ fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", marginBottom: 8 }}>
              Education
            </h2>
            {data.education.map(
              (edu, i) =>
                (edu.degree || edu.school) && (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <p style={{ fontWeight: 600, color: "#1f2937" }}>{edu.degree}</p>
                    <p style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                      {edu.school}
                      {edu.year && ` — ${edu.year}`}
                    </p>
                  </div>
                )
            )}
          </div>
        )}

        {data.skills.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h2 style={{ fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", marginBottom: 8 }}>
              Skills
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {data.skills.map((skill, i) => (
                <li key={i} style={{ color: "#4b5563", marginBottom: 4 }}>
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Right experience column */}
      <div style={{ width: "60%", backgroundColor: "#3d3e42", color: "#9099a0", padding: 32 }}>
        {data.experience.some((e) => e.role || e.company) && (
          <div>
            <h2 style={{ color: "#ffffff", fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
              Experience
            </h2>
            {data.experience.map(
              (exp, i) =>
                (exp.role || exp.company) && (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <p style={{ color: "#ffffff", fontWeight: 600 }}>{exp.role}</p>
                    <p style={{ color: "#66cc99", fontSize: "0.75rem", marginBottom: 4 }}>
                      {exp.company}
                      {exp.dates && ` | ${exp.dates}`}
                    </p>
                    {exp.bullets.length > 0 && (
                      <ul style={{ listStyleType: "disc", listStylePosition: "inside", fontSize: "0.75rem", margin: 0, padding: 0 }}>
                        {exp.bullets.map((b, j) => (
                          <li key={j} style={{ marginBottom: 2 }}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
            )}
          </div>
        )}

        {data.projects.some((p) => p.title || p.description) && (
          <div style={{ marginTop: 20 }}>
            <h2 style={{ color: "#ffffff", fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
              Projects
            </h2>
            {data.projects.map(
              (proj, i) =>
                (proj.title || proj.description) && (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <p style={{ color: "#ffffff", fontWeight: 600 }}>{proj.title}</p>
                    {proj.description && (
                      <p style={{ fontSize: "0.75rem", marginTop: 2 }}>{proj.description}</p>
                    )}
                  </div>
                )
            )}
          </div>
        )}

        {!hasContent && (
          <p style={{ fontStyle: "italic", color: "#9099a0" }}>
            Fill in the form to see your CV here.
          </p>
        )}
      </div>
    </div>
  );
}
