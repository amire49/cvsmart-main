import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FileText, CheckCircle, AlertTriangle, BarChart } from "lucide-react";

const cardClass = "bg-card backdrop-blur-sm border border-border";
const titleClass = "text-sm font-medium text-foreground";
const iconClass = "h-4 w-4 text-muted-foreground";
const valueClass = "text-2xl font-bold text-foreground";
const descClass = "text-xs text-muted-foreground";

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className={cardClass}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className={titleClass}>Resumes Analyzed</CardTitle>
          <FileText className={iconClass} />
        </CardHeader>
        <CardContent>
          <div className={valueClass}>0</div>
          <p className={descClass}>Upload your first resume to get started</p>
        </CardContent>
      </Card>

      <Card className={cardClass}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className={titleClass}>ATS Score</CardTitle>
          <BarChart className={iconClass} />
        </CardHeader>
        <CardContent>
          <div className={valueClass}>N/A</div>
          <p className={descClass}>No resumes analyzed yet</p>
        </CardContent>
      </Card>

      <Card className={cardClass}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className={titleClass}>Strengths</CardTitle>
          <CheckCircle className={iconClass} />
        </CardHeader>
        <CardContent>
          <div className={valueClass}>0</div>
          <p className={descClass}>Identified strengths in your resume</p>
        </CardContent>
      </Card>

      <Card className={cardClass}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className={titleClass}>Improvement Areas</CardTitle>
          <AlertTriangle className={iconClass} />
        </CardHeader>
        <CardContent>
          <div className={valueClass}>0</div>
          <p className={descClass}>Areas that need improvement</p>
        </CardContent>
      </Card>
    </div>
  );
}
