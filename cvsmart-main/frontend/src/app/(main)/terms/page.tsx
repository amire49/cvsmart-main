"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="app-page min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-success rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-ring rounded-full filter blur-[150px] opacity-10" />
      </div>

      <header className="relative z-10 py-12 px-4 border-b border-border backdrop-blur-md">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center tracking-tight text-foreground">
            Terms of <span className="text-display font-serif italic">Service</span>
          </h1>
          <p className="text-center mt-4 text-muted-foreground text-sm">
            Last updated: March 2025
          </p>
        </div>
      </header>

      <main className="relative z-10 container mx-auto max-w-4xl p-6 md:p-8 py-12">
        <div className="prose prose-invert max-w-none space-y-10 text-foreground">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Acceptance of terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By using CVSmart, you agree to these Terms of Service. If you do not agree, please do not use the service. We may update these terms from time to time; continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Use of service</h2>
            <p className="text-muted-foreground leading-relaxed">
              CVSmart provides AI-assisted resume analysis, CV building, and related tools. You may use the service for personal or professional job-seeking purposes in accordance with these terms and applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Account responsibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and for all activity under your account. You must provide accurate information and notify us of any unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Acceptable use</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may not use the service for illegal purposes, to harm others, or to abuse or overload our systems. You may not scrape, reverse-engineer, or resell the service without permission. We may suspend or terminate access for violations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Disclaimers</h2>
            <p className="text-muted-foreground leading-relaxed">
              CVSmart is provided &quot;as is.&quot; We do not guarantee job offers, interview outcomes, or specific results from using the service. Resume analysis and suggestions are advisory only. You are responsible for the content and use of your resume and applications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Limitation of liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by law, CVSmart and its providers shall not be liable for any indirect, incidental, special, or consequential damages, or for loss of data or profits, arising from your use of the service. Our total liability shall not exceed the amount you paid us in the twelve months before the claim (or zero if the service is free).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Changes to terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may modify these terms at any time. We will indicate the &quot;Last updated&quot; date at the top. Material changes may be communicated via the service or email. Your continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Governing law and contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms are governed by the laws of the jurisdiction in which we operate, without regard to conflict-of-law principles. For questions about these terms, contact us at{" "}
              <a href="mailto:support@cvsmart.com" className="text-success hover:text-success/90 underline">
                support@cvsmart.com
              </a>{" "}
              or through the <a href="/contact" className="text-success hover:text-success/90 underline">Contact</a> page.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
