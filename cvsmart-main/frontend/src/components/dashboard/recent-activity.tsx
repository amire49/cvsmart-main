import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export default function RecentActivity() {
  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10 text-white">
      <CardHeader>
        <CardTitle className="text-white/90">Recent Activity</CardTitle>
        <CardDescription className="text-white/60">
          Your latest actions and updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="flex items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none text-white/80">
                Account Created
              </p>
              <p className="text-sm text-white/60">Welcome to CVSmart!</p>
            </div>
            <div className="ml-auto text-sm text-white/50">Just now</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
