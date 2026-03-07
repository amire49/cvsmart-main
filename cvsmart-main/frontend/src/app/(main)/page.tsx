"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Zap,
  BarChart3,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const t = useTranslations("home");
  return (
    <div className="app-page min-h-screen bg-background text-foreground overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-success rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-ring rounded-full filter blur-[150px] opacity-10" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-24 md:pt-24 md:pb-32 min-h-[70vh] flex flex-col justify-center">
        <div
          className="absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: "4rem 4rem",
          }}
        />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-foreground tracking-tight">
              <span className="block">{t("heroTitle1")}</span>
              <span className="text-display font-serif italic">{t("heroTitle2")}</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("heroSubtitle")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="rounded-full px-8 w-full sm:w-auto bg-primary text-primary-foreground hover:opacity-90"
                asChild
              >
                <Link href="/analyze" className="flex items-center justify-center">
                  {t("analyzeMyResume")} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 w-full sm:w-auto border-border bg-transparent hover:bg-accent"
                asChild
              >
                <Link href="/#how-it-works" className="flex items-center justify-center">
                  {t("seeHowItWorks")} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <ul className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                <span>{t("aiPowered")}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                <span>{t("atsOptimization")}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                <span>{t("actionableSuggestions")}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted backdrop-blur-sm border border-border text-sm mb-6 text-foreground">
              <span className="text-success mr-2">✦</span>
              <span>{t("keyFeatures")}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {t("unlockPower")}{" "}
              <span className="text-display font-serif italic">{t("aiDrivenAnalysis")}</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("keyFeaturesSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Zap className="h-6 w-6 text-primary" />, titleKey: "aiPoweredTitle", descKey: "aiPoweredDesc" },
              { icon: <BarChart3 className="h-6 w-6 text-success" />, titleKey: "atsTitle", descKey: "atsDesc" },
              { icon: <CheckCircle2 className="h-6 w-6 text-primary" />, titleKey: "actionableTitle", descKey: "actionableDesc" },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative bg-card backdrop-blur-sm border border-border rounded-xl p-8 hover:bg-accent/50 transition-all duration-300"
              >
                <div className="relative z-10">
                  <div className="bg-muted rounded-xl p-3 w-fit mb-6 text-foreground">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{t(feature.titleKey)}</h3>
                  <p className="text-muted-foreground">{t(feature.descKey)}</p>
                  <div className="mt-6 flex items-center text-sm text-success font-medium">
                    <span>{t("learnMore")}</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-24 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted backdrop-blur-sm border border-border text-sm mb-6 text-foreground">
              <span className="text-primary mr-2">✦</span>
              <span>{t("simpleProcess")}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {t("threeSteps")}{" "}
              <span className="text-display font-serif italic">{t("resumePerfection")}</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("threeStepsSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: "01", titleKey: "step1Title", descKey: "step1Desc" },
              { number: "02", titleKey: "step2Title", descKey: "step2Desc" },
              { number: "03", titleKey: "step3Title", descKey: "step3Desc" },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="absolute top-0 left-0 -mt-6 -ml-6">
                  <div className="bg-primary text-primary-foreground text-2xl font-bold w-16 h-16 rounded-xl flex items-center justify-center">
                    {step.number}
                  </div>
                </div>
                <div className="bg-card backdrop-blur-sm border border-border rounded-xl p-8 pt-12 ml-4 mt-4">
                  <h3 className="text-xl font-bold mb-3 text-foreground">{t(step.titleKey)}</h3>
                  <p className="text-muted-foreground">{t(step.descKey)}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden rounded-2xl bg-primary border border-primary-foreground/10 shadow-xl py-16 px-8 md:px-16">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-primary-foreground tracking-tight">
                {t("ctaTitle")}
              </h2>
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                {t("ctaSubtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="rounded-full px-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-medium shadow-lg"
                  asChild
                >
                  <Link href="/analyze" className="flex items-center justify-center">
                    {t("getStartedFree")} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
