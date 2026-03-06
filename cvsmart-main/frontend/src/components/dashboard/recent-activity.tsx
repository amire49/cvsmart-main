import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export default function RecentActivity() {
  return (
    <Card className="bg-card backdrop-blur-sm border border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Activity</CardTitle>
        <CardDescription className="text-muted-foreground">
          Your latest actions and updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="flex items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none text-foreground">
                Account Created
              </p>
              <p className="text-sm text-muted-foreground">Welcome to CVSmart!</p>
            </div>
            <div className="ml-auto text-sm text-muted-foreground">Just now</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
