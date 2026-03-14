"use client";

import React from "react";
import Link from "next/link";
import { Zap, BarChart3, FileEdit, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="app-page min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-success rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-ring rounded-full filter blur-[150px] opacity-10" />
      </div>

      <main className="relative z-10 container mx-auto max-w-4xl p-6 md:p-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          About <span className="text-display font-serif italic">CVSmart</span>
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-8">
          CVSmart is an AI-assisted platform that helps you analyze, improve, and tailor your resume to modern job
          descriptions.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Our mission</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            We built CVSmart to give job seekers a clear edge: match your resume to job descriptions with AI-powered analysis,
            get actionable feedback, and build ATS-friendly CVs—so you spend less time guessing and more time landing interviews.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">What we offer</h2>
          <ul className="space-y-6">
            <li className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">AI-powered analysis</h3>
                <p className="text-muted-foreground">
                  Upload your resume and a job description; get match scores, strengths, gaps, and tailored recommendations.
                </p>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">ATS optimization</h3>
                <p className="text-muted-foreground">
                  Improve how your resume performs with applicant tracking systems and keyword alignment.
                </p>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <FileEdit className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">CV builder</h3>
                <p className="text-muted-foreground">
                  Create and edit professional CVs with multiple templates and export to PDF.
                </p>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center flex-shrink-0">
                <Target className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Job-focused feedback</h3>
                <p className="text-muted-foreground">
                  Every suggestion is tied to the role you&apos;re applying for, so your resume stays relevant and targeted.
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section className="bg-card backdrop-blur-sm border border-border rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">What&apos;s next</h2>
          <p className="text-muted-foreground leading-relaxed">
            We&apos;re actively working on saved resumes, more CV templates, and job application tracking. Your feedback shapes our roadmap—reach out via the{" "}
            <Link href="/contact" className="text-success hover:text-success/90 underline">Contact</Link> page or check the{" "}
            <Link href="/faq" className="text-success hover:text-success/90 underline">FAQ</Link> for more.
          </p>
        </section>
      </main>
    </div>
  );
}
