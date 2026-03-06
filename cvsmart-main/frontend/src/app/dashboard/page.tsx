"use client";

import ProtectedRoute from "@/components/auth/protected-route";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import RecentActivity from "@/components/dashboard/recent-activity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles } from "lucide-react";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-purple-600 rounded-full filter blur-[150px] opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-cyan-500 rounded-full filter blur-[150px] opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-fuchsia-500 rounded-full filter blur-[150px] opacity-10"></div>
        </div>

        <div className="container mx-auto py-16 px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-md flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-fuchsia-400 text-transparent bg-clip-text">
                Dashboard
              </h1>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-1">
                <TabsTrigger
                  value="overview"
                  className="text-white data-[state=active]:bg-white/20 rounded-md px-4 py-2"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="resumes"
                  className="text-white data-[state=active]:bg-white/20 rounded-md px-4 py-2"
                >
                  My Resumes
                </TabsTrigger>
                <TabsTrigger
                  value="applications"
                  className="text-white data-[state=active]:bg-white/20 rounded-md px-4 py-2"
                >
                  Applications
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <DashboardStats />
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <RecentActivity />
                </div>
              </TabsContent>

              <TabsContent value="resumes">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 text-white">
                    My Resumes
                  </h3>
                  <p className="text-white/70">
                    You haven&apos;t uploaded any resumes yet. Get started by
                    analyzing your first resume.
                  </p>
                  <div className="mt-4">
                    <a
                      href="/analyze"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-br from-purple-500 to-cyan-500 text-white rounded-md hover:opacity-90 transition"
                    >
                      Upload Resume
                    </a>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="applications">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 text-white">
                    Job Applications
                  </h3>
                  <p className="text-white/70">
                    Track your job applications and their status here.
                  </p>
                  <div className="mt-4 text-center p-8 border border-dashed border-white/20 rounded-lg">
                    <p className="text-white/60 mb-2">
                      No applications tracked yet
                    </p>
                    <button className="text-cyan-400 hover:underline">
                      + Add your first application
                    </button>
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
