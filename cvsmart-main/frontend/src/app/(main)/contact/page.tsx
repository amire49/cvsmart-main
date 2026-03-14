"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/Label";
import { toast } from "sonner";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Thanks! We'll get back to you soon.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            Get in <span className="text-display font-serif italic">Touch</span>
          </h1>
          <p className="text-center mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Have a question or feedback? We&apos;d love to hear from you.
          </p>
        </div>
      </header>

      <main className="relative z-10 container mx-auto max-w-4xl p-6 md:p-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6 bg-card backdrop-blur-sm border border-border rounded-2xl p-6 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="bg-muted border-input text-foreground placeholder:text-muted-foreground rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-muted border-input text-foreground placeholder:text-muted-foreground rounded-xl"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-foreground">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What is this about?"
                  className="bg-muted border-input text-foreground placeholder:text-muted-foreground rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-foreground">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your message..."
                  className="min-h-[160px] bg-muted border-input text-foreground placeholder:text-muted-foreground rounded-xl"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="rounded-xl font-semibold">
                {loading ? "Sending..." : "Send message"}
              </Button>
            </form>
          </div>
          <div className="space-y-6">
            <div className="bg-card backdrop-blur-sm border border-border rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Email support
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Prefer email? Reach us at:
              </p>
              <a
                href="mailto:support@cvsmart.com"
                className="text-success hover:text-success/90 transition-colors font-medium"
              >
                support@cvsmart.com
              </a>
            </div>
            <div className="bg-card backdrop-blur-sm border border-border rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-2">FAQ</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Find quick answers to common questions.
              </p>
              <Button variant="outline" className="rounded-xl" asChild>
                <Link href="/faq">
                  Visit FAQ <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
