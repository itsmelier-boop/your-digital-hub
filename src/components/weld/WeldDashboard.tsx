import { WeldJoint } from "@/types/weld";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatistics } from "@/utils/weldClassification";
import { Activity, CheckCircle, Clock, XCircle, Users, Layers } from "lucide-react";

interface WeldDashboardProps {
  joints: WeldJoint[];
}

export const WeldDashboard = ({ joints }: WeldDashboardProps) => {
  const stats = getStatistics(joints);

  const statCards = [
    {
      title: "Total Joints",
      value: stats.totalJoints,
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Completed",
      value: stats.completedJoints,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Pending",
      value: stats.pendingJoints,
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Rejected",
      value: stats.rejectedJoints,
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Active Welders",
      value: stats.uniqueWelders,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Material Types",
      value: stats.uniqueMaterials,
      icon: Layers,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{stats.completionRate.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {joints.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Add weld joints to see dashboard statistics
          </CardContent>
        </Card>
      )}
    </div>
  );
};
