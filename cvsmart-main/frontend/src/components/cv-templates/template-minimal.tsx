import React from "react";
import type { CVData } from "./types";

interface Props {
  data: CVData;
}

export function TemplateMinimal({ data }: Props) {
  const { personal } = data;
  const name = personal.fullName || "Your Name";
  const contactParts = [personal.email, personal.phone, personal.location, personal.website].filter(Boolean);

  const hasContent =
    personal.fullName ||
    data.summary ||
    data.experience.some((e) => e.role || e.company) ||
    data.education.some((e) => e.degree || e.school) ||
    data.skills.length > 0 ||
    data.projects.some((p) => p.title || p.description);

  return (
    <div
      style={{ fontSize: 13, fontFamily: "'Open Sans', sans-serif", minHeight: 700, backgroundColor: "#ffffff", padding: 24, boxSizing: "border-box" }}
    >
      {/* Header */}
      <div style={{ backgroundColor: "#434E5E", color: "#ffffff", padding: "28px 32px" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "0.05em" }}>{name}</h1>
        {personal.title && (
          <p style={{ color: "#d1d5db", fontSize: "0.875rem", marginTop: 4 }}>{personal.title}</p>
        )}
        {contactParts.length > 0 && (
          <p style={{ color: "#9ca3af", fontSize: "0.6875rem", marginTop: 8 }}>
            {contactParts.join("  \u2022  ")}
          </p>
        )}
        {(personal.linkedin || personal.github) && (
          <p style={{ color: "#9ca3af", fontSize: "0.6875rem", marginTop: 2 }}>
            {[personal.linkedin, personal.github].filter(Boolean).join("  \u2022  ")}
          </p>
        )}
        {data.summary && (
          <p style={{ color: "#d1d5db", fontSize: "0.75rem", marginTop: 12, lineHeight: 1.625, whiteSpace: "pre-wrap", maxWidth: 600 }}>
            {data.summary}
          </p>
        )}
      </div>

      {/* Body: 75/25 grid */}
      <div style={{ display: "flex" }}>
        {/* Main column (75%) */}
        <div style={{ width: "75%", padding: 24 }}>
          {data.experience.some((e) => e.role || e.company) && (
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#434E5E", marginBottom: 12, borderBottom: "2px solid #434E5E", paddingBottom: 4 }}>
                Experience
              </h2>
              {data.experience.map(
                (exp, i) =>
                  (exp.role || exp.company) && (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <p style={{ fontWeight: 600, color: "#111827" }}>
                          {exp.role}
                        </p>
                        {exp.dates && (
                          <span style={{ fontSize: "0.6875rem", color: "#9ca3af", flexShrink: 0, marginLeft: 8 }}>
                            {exp.dates}
                          </span>
                        )}
                      </div>
                      <p style={{ color: "#58677c", fontSize: "0.75rem", marginBottom: 4 }}>
                        {exp.company}
                      </p>
                      {exp.bullets.length > 0 && (
                        <ul style={{ listStyleType: "disc", listStylePosition: "inside", color: "#4b5563", fontSize: "0.75rem", margin: 0, padding: 0 }}>
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
            <div>
              <h2 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#434E5E", marginBottom: 12, borderBottom: "2px solid #434E5E", paddingBottom: 4 }}>
                Projects
              </h2>
              {data.projects.map(
                (proj, i) =>
                  (proj.title || proj.description) && (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <p style={{ fontWeight: 600, color: "#111827" }}>
                        {proj.title}
                      </p>
                      {proj.description && (
                        <p style={{ color: "#4b5563", fontSize: "0.75rem", marginTop: 2 }}>
                          {proj.description}
                        </p>
                      )}
                    </div>
                  )
              )}
            </div>
          )}

          {!hasContent && (
            <p style={{ fontStyle: "italic", color: "#9ca3af" }}>
              Fill in the form to see your CV here.
            </p>
          )}
        </div>

        {/* Side column (25%) */}
        <div style={{ width: "25%", padding: 24, backgroundColor: "#f9fafb" }}>
          {data.education.some((e) => e.degree || e.school) && (
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#434E5E", marginBottom: 8, borderBottom: "1px solid #d1d5db", paddingBottom: 4 }}>
                Education
              </h2>
              {data.education.map(
                (edu, i) =>
                  (edu.degree || edu.school) && (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <p style={{ fontWeight: 600, color: "#1f2937", fontSize: "0.75rem" }}>
                        {edu.degree}
                      </p>
                      <p style={{ color: "#6b7280", fontSize: "0.6875rem" }}>
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
              <h2 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#434E5E", marginBottom: 8, borderBottom: "1px solid #d1d5db", paddingBottom: 4 }}>
                Skills
              </h2>
              <div>
                {data.skills.map((skill, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <p style={{ color: "#374151", fontSize: "0.75rem", marginBottom: 2 }}>{skill}</p>
                    <div style={{ height: 6, backgroundColor: "#e5e7eb", borderRadius: 9999 }}>
                      <div
                        style={{ height: 6, backgroundColor: "#58677c", borderRadius: 9999, width: `${75 + ((i * 13) % 25)}%` }}
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
