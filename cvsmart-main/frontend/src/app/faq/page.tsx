"use client"

import { useState } from "react"
import { Sparkles, ChevronDown, ChevronUp, Search, ArrowRight,  Twitter,
  Facebook,
  Instagram,
  Linkedin, } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import Link from "next/link"

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const faqItems = [
    {
      question: "What is the Resume Analyzer?",
      answer:
        "The Resume Analyzer is an AI-powered tool that helps job seekers improve their resumes by analyzing their content, comparing it with a job description, and suggesting feedback using natural language processing (NLP) and large language models (LLMs).",
    },
    {
      question: "How does it work?",
      answer: (
        <div className="space-y-4">
          <p>Users upload their resume and optionally a job description. The system then:</p>
          <ul className="space-y-2">
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 mr-2"></div>
              <span>Extracts key entities (skills, education, experience)</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 mr-2"></div>
              <span>Compares resume content with job requirements</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 mr-2"></div>
              <span>Provides improvement suggestions and rewrites sections using Google Gemini or similar LLMs</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      question: "Is my personal data safe?",
      answer:
        "Yes. We do not store or share your resume or job description content. All analysis is done temporarily and securely. However, always avoid uploading sensitive personal information.",
    },
    {
      question: "What kind of resumes are supported?",
      answer: (
        <div className="space-y-4">
          <p>Currently, we support resumes in:</p>
          <ul className="space-y-2">
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 mr-2"></div>
              <span>PDF (.pdf)</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 mr-2"></div>
              <span>DOCX (.docx)</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 mr-2"></div>
              <span>Plain Text (.txt)</span>
            </li>
          </ul>
          <p>Other formats will be supported in future versions.</p>
        </div>
      ),
    },
    {
      question: "What kind of feedback will I receive?",
      answer: (
        <div className="space-y-4">
          <p>You'll receive:</p>
          <ul className="space-y-2">
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 mr-2"></div>
              <span>Matched vs. missing keywords</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 mr-2"></div>
              <span>Rewritten bullet points</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 mr-2"></div>
              <span>Summary or objective rephrasing</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 mr-2"></div>
              <span>Suggestions to align better with a specific job description</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      question: "Do I need to provide a job description?",
      answer:
        "Providing a job description recommended. It allows the system to tailor your resume more specifically to the job you're applying for.",
    },
    
    {
      question: "Who can use this platform?",
      answer: (
        <div className="space-y-4">
          <p>Anyone looking to improve their resume! It's ideal for:</p>
          <ul className="space-y-2">
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 mr-2"></div>
              <span>Job seekers</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 mr-2"></div>
              <span>Students and graduates</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 mr-2"></div>
              <span>Career switchers</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 mr-2"></div>
              <span>Recruiters testing candidate resumes</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      question: "What technologies power this tool?",
      answer: (
        <div className="space-y-4">
          <p>The platform uses:</p>
          <ul className="space-y-2">
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 mr-2"></div>
              <span>Google Gemini API (or other LLMs) for language understanding</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 mr-2"></div>
              <span>NLP libraries for resume parsing</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 mr-2"></div>
              <span>A custom backend built with Flask</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 mr-2"></div>
              <span>A modern frontend using Next.js and Tailwind CSS</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      question: "Is this tool free to use?",
      answer:
        "Yes, it is completely free for now as a student-driven open-source project. Future versions may include additional features that could require user accounts or subscriptions.",
    },
    {
      question: "I found a bug or want to suggest a feature. What should I do?",
      answer:
        'You can submit feedback directly through the "Contact Us" page or report issues on our GitHub Repository.',
    },
    {
      question: "Will this guarantee me a job?",
      answer:
        "No tool can guarantee a job. However, our system improves your resume's structure, relevance, and clarity, giving you a better chance to catch a recruiter's attention.",
    },
  ]

  const filteredFAQs = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof item.answer === "string" && item.answer.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-purple-600 rounded-full filter blur-[150px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-cyan-500 rounded-full filter blur-[150px] opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-fuchsia-500 rounded-full filter blur-[150px] opacity-10"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 py-12 px-4 border-b border-white/10 backdrop-blur-md">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center tracking-tight">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-fuchsia-400 text-transparent bg-clip-text">
              Questions
            </span>
          </h1>
          <p className="text-center mt-4 text-white/70 text-lg max-w-2xl mx-auto">
            Everything you need to know about our AI-powered Resume Analyzer platform
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto max-w-4xl p-6 md:p-8 py-12">
        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-white/40" />
            </div>
            <Input
              type="tex</React.SetStateAction>t"
              placeholder="Search questions..."
              className="pl-10 bg-white/5 border-white/10 focus:border-purple-500/50 text-white placeholder:text-white/40"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((item, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:bg-white/10"
              >
                <button
                  className="w-full px-6 py-5 flex justify-between items-center text-left"
                  onClick={() => toggleFAQ(index)}
                >
                  <h3 className="text-lg font-medium text-white">{item.question}</h3>
                  <div className="ml-4 flex-shrink-0">
                    {expandedIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-purple-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-white/60" />
                    )}
                  </div>
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ${
                    expandedIndex === index ? "max-h-[1000px] pb-6" : "max-h-0"
                  }`}
                >
                  <div className="text-white/80 leading-relaxed">{item.answer}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">No questions found matching your search.</p>
              <button
                className="mt-4 text-purple-400 hover:text-purple-300 transition-colors"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Still Have Questions Section */}
        <div className="mt-16 relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-600"></div>
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=200&width=200')] opacity-10"></div>
          <div className="relative z-10 py-12 px-8 md:px-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Still have questions?</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              If you couldn't find the answer to your question, feel free to reach out to our support team.
            </p>
            <Button className="bg-white text-purple-700 hover:bg-white/90 rounded-full px-8" asChild>
              <Link href="/contact">
                Contact Support <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 pt-16 pb-8">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-md flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                CVSmart
              </span>
            </div>
            <div className="flex space-x-8">
              {[
                {
                  name: "Twitter",
                  href: "https://twitter.com",
                  icon: <Twitter className="w-5 h-5 text-white/70" />,
                },
                {
                  name: "Facebook",
                  href: "https://facebook.com",
                  icon: <Facebook className="w-5 h-5 text-white/70" />,
                },
                {
                  name: "Instagram",
                  href: "https://instagram.com",
                  icon: <Instagram className="w-5 h-5 text-white/70" />,
                },
                {
                  name: "LinkedIn",
                  href: "https://linkedin.com",
                  icon: <Linkedin className="w-5 h-5 text-white/70" />,
                },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <span className="sr-only">{social.name}</span>

                  {social.icon}
                </a>
              ))}
            </div>
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} CVSmart. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
