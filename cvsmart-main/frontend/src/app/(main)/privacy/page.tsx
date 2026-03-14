"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export default function PrivacyPage() {
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
            Privacy <span className="text-display font-serif italic">Policy</span>
          </h1>
          <p className="text-center mt-4 text-muted-foreground text-sm">
            Last updated: March 2025
          </p>
        </div>
      </header>

      <main className="relative z-10 container mx-auto max-w-4xl p-6 md:p-8 py-12">
        <div className="prose prose-invert max-w-none space-y-10 text-foreground">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">What we collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect account information (email, profile data you provide) when you sign up. When you use our resume analysis, we process your resume and job description temporarily to provide the service. We do not store resume or job description content unless you explicitly save it (e.g. in your profile or dashboard). We may collect usage data (e.g. feature usage) to improve the product.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">How we use it</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use your data to provide and improve CVSmart: to run analyses, personalize your experience, and fix issues. We do not sell your personal data. We may use aggregated, non-identifying data for analytics and product development.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Data retention and security</h2>
            <p className="text-muted-foreground leading-relaxed">
              Account and profile data are retained while your account is active. Analysis inputs (resume, job description) are processed in memory or temporarily and are not retained unless you save them. We use industry-standard measures to protect your data in transit and at rest.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Third parties</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use third-party services to run CVSmart: hosting (e.g. Vercel), authentication and database (e.g. Supabase), and AI providers for analysis. These parties process data only as necessary to provide the service and under their respective privacy policies. We do not share your data for marketing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Your rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You can access, update, or delete your account and profile data from the settings and profile pages. You may request a copy of your data or deletion of your account by contacting us. Applicable law may give you additional rights (e.g. GDPR, CCPA).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy-related questions or requests, contact us at{" "}
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
