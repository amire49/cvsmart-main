"use client";

import React from "react";

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
        <p className="text-muted-foreground text-lg leading-relaxed mb-4">
          CVSmart is an AI-assisted platform that helps you analyze, improve, and tailor your resume to modern job
          descriptions.
        </p>
        <p className="text-muted-foreground text-lg leading-relaxed">
          This page is a simple placeholder for now so the deployment can succeed. You can expand it later with more
          details about the product, team, or roadmap.
        </p>
      </main>
    </div>
  );
}

