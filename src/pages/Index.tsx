import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { RecentProjects } from "@/components/RecentProjects";
import { QuickActions } from "@/components/QuickActions";
import { Building2, ShoppingCart, Wallet, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useProjects } from "@/contexts/ProjectContext";
import { useState } from "react";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";

const Index = () => {
  const { projects, addProject } = useProjects();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleProjectCreated = (newProject: { projectName: string; clientName: string }) => {
    addProject({
      name: newProject.projectName,
      client: newProject.clientName,
      status: "Active",
      orders: 0,
      budget: "₹0",
      createdDate: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    });
  };

  const totalOrders = projects.reduce((sum, p) => sum + p.orders, 0);
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      
      <main className="ml-64 pt-16">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, User!</h1>
              <p className="text-muted-foreground">Here's what's happening with your projects today.</p>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-5 h-5" />
              New Project
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Active Projects"
              value={projects.filter(p => p.status === "Active").length}
              change="+2 this month"
              changeType="positive"
              icon={Building2}
              iconColor="bg-primary"
            />
            <StatCard
              title="Total Orders"
              value={totalOrders}
              change="+12 this week"
              changeType="positive"
              icon={ShoppingCart}
              iconColor="bg-accent"
            />
            <StatCard
              title="Pending Payments"
              value="₹45.2L"
              change="-₹8.5L cleared"
              changeType="positive"
              icon={Wallet}
              iconColor="bg-warning"
            />
            <StatCard
              title="Completed This Month"
              value="8"
              change="2x from last month"
              changeType="positive"
              icon={CheckCircle2}
              iconColor="bg-success"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentProjects />
            </div>
            <div>
              <QuickActions />
            </div>
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

export default Index;
