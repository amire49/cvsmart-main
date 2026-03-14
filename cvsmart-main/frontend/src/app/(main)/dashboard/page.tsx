"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import RecentActivity from "@/components/dashboard/recent-activity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="app-page min-h-screen bg-background text-foreground overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary rounded-full filter blur-[150px] opacity-20" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-success rounded-full filter blur-[150px] opacity-20" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-ring rounded-full filter blur-[150px] opacity-10" />
        </div>

        <div className="container mx-auto py-16 px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  Dashboard
                </h1>
              </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-6 bg-muted backdrop-blur-sm border border-border rounded-lg p-1">
                <TabsTrigger
                  value="overview"
                  className="text-foreground data-[state=active]:bg-accent rounded-md px-4 py-2"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="resumes"
                  className="text-foreground data-[state=active]:bg-accent rounded-md px-4 py-2"
                >
                  My Resumes
                </TabsTrigger>
                <TabsTrigger
                  value="applications"
                  className="text-foreground data-[state=active]:bg-accent rounded-md px-4 py-2"
                >
                  Applications
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="bg-card backdrop-blur-sm border border-border rounded-xl p-6">
                  <DashboardStats />
                </div>
                <div className="bg-card backdrop-blur-sm border border-border rounded-xl p-6">
                  <RecentActivity />
                </div>
              </TabsContent>

              <TabsContent value="resumes">
                <div className="bg-card backdrop-blur-sm border border-border rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    My Resumes
                  </h3>
                  <p className="text-muted-foreground">
                    You haven&apos;t uploaded any resumes yet. Get started by
                    analyzing your first resume.
                  </p>
                  <div className="mt-4">
                    <Button asChild className="rounded-md">
                      <Link href="/analyze">Upload Resume</Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="applications">
                <div className="bg-card backdrop-blur-sm border border-border rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    Job Applications
                  </h3>
                  <p className="text-muted-foreground">
                    Track your job applications and their status here.
                  </p>
                  <div className="mt-4 text-center p-8 border border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground mb-2">
                      No applications tracked yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Application tracking is coming soon.
                    </p>
                    <Button variant="outline" disabled className="mt-4 rounded-md opacity-70 cursor-not-allowed">
                      Coming soon
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
