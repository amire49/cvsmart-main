import Link from "next/link";
import { Sparkles, Twitter, Facebook, Instagram, Linkedin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6 inline-flex">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                CVSmart
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md">
              CVSmart uses advanced artificial intelligence to analyze resumes
              and provide actionable insights to help job seekers land more
              interviews.
            </p>
            <div className="flex space-x-4">
              {[
                { name: "Twitter", href: "https://twitter.com", icon: <Twitter className="w-5 h-5 text-muted-foreground" /> },
                { name: "Facebook", href: "https://facebook.com", icon: <Facebook className="w-5 h-5 text-muted-foreground" /> },
                { name: "Instagram", href: "https://instagram.com", icon: <Instagram className="w-5 h-5 text-muted-foreground" /> },
                { name: "LinkedIn", href: "https://linkedin.com", icon: <Linkedin className="w-5 h-5 text-muted-foreground" /> },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <span className="sr-only">{social.name}</span>
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-foreground">Product</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-foreground">Team Details</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} CVSmart. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
