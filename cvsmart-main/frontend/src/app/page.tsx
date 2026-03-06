"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  Zap,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  LogOut,
  LayoutDashboard,
  User,
  Settings,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

export default function Home() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const supabase = createClientComponentClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsSignedIn(!!session);
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsSignedIn(false);
      setUserEmail(null);
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-purple-600 rounded-full filter blur-[150px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-cyan-500 rounded-full filter blur-[150px] opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-fuchsia-500 rounded-full filter blur-[150px] opacity-10"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              CVSmart
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-white/70 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-white/70 hover:text-white transition-colors"
            >
              How It Works
            </Link>
            {!isLoading && (
              <div className="flex items-center space-x-4 ml-4">
                {isSignedIn ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        className="transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg active:scale-100 p-0 h-auto bg-transparent"
                      >
                        <img
                          src="/user-profile.png"
                          alt="User Profile"
                          width={40}
                          height={40}
                          className="rounded-full transition-transform duration-300"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-gray-900 border border-gray-800 text-white"
                    >
                      {userEmail && (
                        <>
                          <div className="px-2 py-1.5 text-sm font-medium text-gray-400 truncate">
                            {userEmail}
                          </div>
                          <DropdownMenuSeparator className="bg-gray-800" />
                        </>
                      )}
                      <DropdownMenuItem className="text-white hover:bg-gray-800 cursor-pointer">
                        <Link
                          href="/dashboard"
                          className="flex items-center w-full"
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-white hover:bg-gray-800 cursor-pointer">
                        <Link
                          href="/profile"
                          className="flex items-center w-full"
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-white hover:bg-gray-800 cursor-pointer">
                        <Link
                          href="/setting"
                          className="flex items-center w-full"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-800" />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-400 hover:text-red-300 hover:bg-gray-800 cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      Sign In
                    </Link>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 rounded-full px-4"
                    >
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm">
                <span className="flex h-2 w-2 rounded-full bg-cyan-500 mr-2"></span>
                <span>AI-Powered Resume Analysis</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="block">Your Resume,</span>
                <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-fuchsia-400 text-transparent bg-clip-text">
                  Supercharged
                </span>
              </h1>

              <p className="text-xl text-white/70 max-w-lg">
                Our AI analyzes your resume, identifies weaknesses, and provides
                actionable suggestions to help you land your dream job.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 rounded-full px-8"
                >
                  <Link href="/analyze" className="flex items-center">
                    Analyze My Resume <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 rounded-full px-8"
                >
                  <Link href="#how-it-works"
                    className="flex items-center w-full h-full">
                    See How It Works <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl blur-xl opacity-30 -rotate-6"></div>
              <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-1 rotate-3">
                <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-xs text-white/50">CVSmart.ai</div>
                  </div>

                  <div className="space-y-4">
                    <div className="h-8 bg-white/5 rounded-md w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-white/5 rounded-sm w-full"></div>
                      <div className="h-4 bg-white/5 rounded-sm w-5/6"></div>
                      <div className="h-4 bg-white/5 rounded-sm w-4/6"></div>
                    </div>

                    <div className="pt-4 space-y-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <div className="h-4 bg-gradient-to-r from-green-500/20 to-transparent rounded-sm w-5/6"></div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-yellow-500" />
                        <div className="h-4 bg-gradient-to-r from-yellow-500/20 to-transparent rounded-sm w-4/6"></div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-red-500" />
                        <div className="h-4 bg-gradient-to-r from-red-500/20 to-transparent rounded-sm w-3/6"></div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <div className="h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-md w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-purple-500 to-transparent rounded-full blur-2xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative z-10 py-24 border-t border-white/10"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm mb-6">
              <span className="text-cyan-400 mr-2">✦</span>
              <span>Key Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Unlock the Power of{" "}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text">
                AI-Driven Analysis
              </span>
            </h2>
            <p className="text-xl text-white/70">
              Our cutting-edge AI technology analyzes every aspect of your
              resume to help you stand out from the competition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="h-6 w-6 text-purple-400" />,
                title: "AI-Powered Analysis",
                description:
                  "Our advanced AI scans your resume and provides detailed feedback on content, structure, and formatting.",
              },
              {
                icon: <BarChart3 className="h-6 w-6 text-cyan-400" />,
                title: "ATS Optimization",
                description:
                  "Ensure your resume gets past Applicant Tracking Systems with our specialized optimization tools.",
              },
              {
                icon: <CheckCircle2 className="h-6 w-6 text-fuchsia-400" />,
                title: "Actionable Suggestions",
                description:
                  "Receive specific, step-by-step recommendations to strengthen your resume and increase interview chances.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
                <div className="relative z-10">
                  <div className="bg-white/10 rounded-xl p-3 w-fit mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                  <div className="mt-6 flex items-center text-sm text-cyan-400 font-medium">
                    <span>Learn more</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="relative z-10 py-24 border-t border-white/10"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm mb-6">
              <span className="text-purple-400 mr-2">✦</span>
              <span>Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Three Steps to{" "}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text">
                Resume Perfection
              </span>
            </h2>
            <p className="text-xl text-white/70">
              Our streamlined process makes it easy to improve your resume and
              land more interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                title: "Upload Your Resume",
                description:
                  "Simply upload your current resume in any format. Our system accepts PDF, DOCX, and more.",
                color: "from-purple-500 to-purple-700",
              },
              {
                number: "02",
                title: "AI Analysis",
                description:
                  "Our AI engine scans your resume, identifies strengths and weaknesses, and generates insights.",
                color: "from-cyan-500 to-cyan-700",
              },
              {
                number: "03",
                title: "Implement & Apply",
                description:
                  "Follow our actionable recommendations, download your improved resume, and apply with confidence.",
                color: "from-fuchsia-500 to-fuchsia-700",
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="absolute top-0 left-0 -mt-6 -ml-6">
                  <div
                    className={`bg-gradient-to-br ${step.color} text-white text-2xl font-bold w-16 h-16 rounded-xl flex items-center justify-center`}
                  >
                    {step.number}
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 pt-12 ml-4 mt-4">
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-white/70">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2">
                    <ArrowRight className="h-6 w-6 text-white/30" />
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
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-600"></div>
            <div className="absolute inset-0 bg-[url('/placeholder.svg?height=200&width=200')] opacity-10"></div>
            <div className="relative z-10 py-16 px-8 md:px-16">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Ready to Transform Your Career?
                </h2>
                <p className="text-xl text-white/90 mb-10">
                  Join thousands of professionals who have already improved
                  their resumes and landed their dream jobs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-white text-purple-700 hover:bg-white/90 rounded-full px-8"
                  >
                    <Link href="/analyze" className="flex items-center">
                      Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-md flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">
                  CVSmart
                </span>
              </div>
              <p className="text-white/70 mb-6 max-w-md">
                CVSmart uses advanced artificial intelligence to analyze
                resumes and provide actionable insights to help job seekers land
                more interviews.
              </p>
              <div className="flex space-x-4">
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
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Product</h4>
              <ul className="space-y-4">
                {["Features", "FAQ"].map((item) => (
                  <li key={item}>
                    <Link
                      href={item === "FAQ" ? "/faq" : "#"}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Team Details</h4>
              <ul className="space-y-4">
                {["About", "Contact", "Privacy", "Terms"].map((item) => {
                  const hrefMap: { [key: string]: string } = {
                    About: "/about",
                    Contact: "/contact",
                    Privacy: "/privacy",
                    Terms: "/terms",
                  };
                  return (
                    <li key={item}>
                      <Link
                        href={hrefMap[item] || "#"}
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        {item}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/50 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} CVSmart. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
