import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Building2, Calendar, IndianRupee } from "lucide-react";

const projects = [
  {
    id: 1,
    name: "Shivam Enterprises Project",
    client: "Shivam Enterprises Pvt Ltd",
    projectId: "PROJ-001",
    dueDate: "2024-12-15",
    value: "₹1.2Cr",
    progress: 65,
    status: "Active"
  },
  {
    id: 2,
    name: "Corporate Office Building",
    client: "Tech Solutions Inc",
    projectId: "PROJ-002",
    dueDate: "2024-12-28",
    value: "₹2.5Cr",
    progress: 42,
    status: "Active"
  },
  {
    id: 3,
    name: "Residential Complex Phase 2",
    client: "Green Homes Pvt Ltd",
    projectId: "PROJ-003",
    dueDate: "2025-01-10",
    value: "₹3.8Cr",
    progress: 28,
    status: "Active"
  }
];

export function RecentProjects() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Building2 className="w-5 h-5 text-foreground" />
        <h2 className="text-xl font-bold text-foreground">Recent Projects</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Overview of your current active projects</p>
      
      <div className="space-y-4">
        {projects.map((project) => (
          <div 
            key={project.id} 
            className="p-4 rounded-lg border border-border hover:border-primary/50 hover:shadow-sm transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{project.name}</h3>
                  <Badge className="bg-success text-success-foreground">{project.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{project.client}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            
            <div className="flex items-center gap-6 mb-3 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <span>{project.projectId}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Due: {project.dueDate}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <IndianRupee className="w-4 h-4" />
                <span>{project.value}</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold text-foreground">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
