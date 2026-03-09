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
      style={{ fontSize: 13, fontFamily: "'Open Sans', sans-serif", display: "flex", minHeight: 700, backgroundColor: "#ffffff", boxShadow: "0 20px 25px -5px rgba(0,0,0,.1)" }}
    >
      {/* Sidebar */}
      <div style={{ width: 280, backgroundColor: "#F7E0C1", padding: 28, flexShrink: 0 }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111827", marginBottom: 2 }}>{name}</h2>
        {personal.title && (
          <p style={{ fontSize: "0.75rem", color: "#4b5563", marginBottom: 16 }}>{personal.title}</p>
        )}

        {hasContact && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#374151", marginBottom: 4, borderBottom: "1px solid rgba(156,163,175,0.4)", paddingBottom: 4 }}>
              Contact
            </h3>
            <div style={{ fontSize: "0.6875rem", color: "#374151", marginTop: 6 }}>
              {personal.email && <p style={{ marginBottom: 4 }}>{personal.email}</p>}
              {personal.phone && <p style={{ marginBottom: 4 }}>{personal.phone}</p>}
              {personal.location && <p style={{ marginBottom: 4 }}>{personal.location}</p>}
              {personal.website && <p style={{ marginBottom: 4 }}>{personal.website}</p>}
              {personal.linkedin && <p style={{ marginBottom: 4 }}>{personal.linkedin}</p>}
              {personal.github && <p style={{ marginBottom: 4 }}>{personal.github}</p>}
            </div>
          </div>
        )}

        {data.summary && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#374151", marginBottom: 4, borderBottom: "1px solid rgba(156,163,175,0.4)", paddingBottom: 4 }}>
              About Me
            </h3>
            <p style={{ color: "#374151", whiteSpace: "pre-wrap", lineHeight: 1.625, fontSize: "0.75rem" }}>
              {data.summary}
            </p>
          </div>
        )}

        {data.education.some((e) => e.degree || e.school) && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#374151", marginBottom: 4, borderBottom: "1px solid rgba(156,163,175,0.4)", paddingBottom: 4 }}>
              Education
            </h3>
            {data.education.map(
              (edu, i) =>
                (edu.degree || edu.school) && (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <p style={{ fontWeight: 600, color: "#1f2937", fontSize: "0.75rem" }}>
                      {edu.degree}
                    </p>
                    <p style={{ color: "#4b5563", fontSize: "0.6875rem" }}>
                      {edu.school}
                      {edu.year && ` — ${edu.year}`}
                    </p>
                  </div>
                )
            )}
          </div>
        )}

        {data.skills.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#374151", marginBottom: 4, borderBottom: "1px solid rgba(156,163,175,0.4)", paddingBottom: 4 }}>
              Skills
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {data.skills.map((skill, i) => (
                <span
                  key={i}
                  style={{ backgroundColor: "rgba(255,255,255,0.6)", color: "#1f2937", padding: "2px 8px", borderRadius: 4, fontSize: "0.6875rem" }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: 32 }}>
        {data.experience.some((e) => e.role || e.company) && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#1f2937", marginBottom: 12, borderBottom: "2px solid #F7E0C1", paddingBottom: 4 }}>
              Experience
            </h2>
            {data.experience.map(
              (exp, i) =>
                (exp.role || exp.company) && (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <p style={{ fontWeight: 600, color: "#111827" }}>{exp.role}</p>
                      {exp.dates && (
                        <span style={{ fontSize: "0.6875rem", color: "#9ca3af", flexShrink: 0, marginLeft: 8 }}>
                          {exp.dates}
                        </span>
                      )}
                    </div>
                    <p style={{ color: "#c0884d", fontSize: "0.75rem", marginBottom: 4 }}>{exp.company}</p>
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
            <h2 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#1f2937", marginBottom: 12, borderBottom: "2px solid #F7E0C1", paddingBottom: 4 }}>
              Projects
            </h2>
            {data.projects.map(
              (proj, i) =>
                (proj.title || proj.description) && (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <p style={{ fontWeight: 600, color: "#111827" }}>{proj.title}</p>
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
    </div>
  );
}
