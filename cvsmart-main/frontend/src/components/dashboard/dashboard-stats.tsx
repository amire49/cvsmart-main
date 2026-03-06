import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FileText, CheckCircle, AlertTriangle, BarChart } from "lucide-react";

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 text-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-white/80">
            Resumes Analyzed
          </CardTitle>
          <FileText className="h-4 w-4 text-white/50" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-white/60">
            Upload your first resume to get started
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 text-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-white/80">
            ATS Score
          </CardTitle>
          <BarChart className="h-4 w-4 text-white/50" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">N/A</div>
          <p className="text-xs text-white/60">No resumes analyzed yet</p>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 text-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-white/80">
            Strengths
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-white/50" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-white/60">
            Identified strengths in your resume
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 text-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-white/80">
            Improvement Areas
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-white/50" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-white/60">Areas that need improvement</p>
        </CardContent>
      </Card>
    </div>
  );
}
