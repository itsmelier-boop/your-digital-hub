import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { Plus, Eye, Pencil, Trash2, Users, FolderKanban, DollarSign, ShoppingCart } from "lucide-react";

const initialProjects = [
  {
    id: 1,
    name: "Shivam Enterprises Project",
    client: "Shivam Enterprises",
    status: "Active",
    orders: 1,
    budget: "₹60,25,000",
    createdDate: "10/18/2025"
  },
  {
    id: 2,
    name: "FG",
    client: "DCV",
    status: "Active",
    orders: 1,
    budget: "₹2,93,427",
    createdDate: "11/9/2025"
  }
];

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(initialProjects);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleProjectCreated = (newProject: { projectName: string; clientName: string }) => {
    const project = {
      id: projects.length + 1,
      name: newProject.projectName,
      client: newProject.clientName,
      status: "Active" as const,
      orders: 0,
      budget: "₹0",
      createdDate: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    };
    setProjects([...projects, project]);
  };

  const handleViewDetails = (projectId: number) => {
    navigate(`/projects/${projectId}`);
  };

  const totalProjects = projects.length;
  const totalBudget = "₹63,18,427";
  const totalOrders = projects.reduce((sum, p) => sum + p.orders, 0);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      
      <main className="ml-64 pt-16">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Projects</h1>
              <p className="text-muted-foreground">Manage your construction projects and track progress</p>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-5 h-5" />
              Add Project
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {projects.map((project) => (
              <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">{project.name}</h3>
                      <Badge className="bg-success text-success-foreground">{project.status}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{project.client}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Orders</p>
                    <p className="text-lg font-semibold text-foreground">{project.orders}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Budget</p>
                    <p className="text-lg font-semibold text-primary">{project.budget}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2"
                    onClick={() => handleViewDetails(project.id)}
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Pencil className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">Created {project.createdDate}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderKanban className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalProjects}</p>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalBudget}</p>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <CreateProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default Projects;
