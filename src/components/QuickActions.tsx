import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Building2, ShoppingCart } from "lucide-react";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { CreateOrderDialog } from "@/components/CreateOrderDialog";
import { useProjects } from "@/contexts/ProjectContext";

const actions = [
  {
    id: 1,
    icon: Building2,
    title: "Add New Project",
    description: "Start a new construction project",
    color: "bg-primary",
    action: "project"
  },
  {
    id: 2,
    icon: ShoppingCart,
    title: "Create Order",
    description: "Add new order to any project",
    color: "bg-accent",
    action: "order"
  }
];

export function QuickActions() {
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const { addProject } = useProjects();

  const handleAction = (actionType: string) => {
    if (actionType === "project") {
      setIsProjectDialogOpen(true);
    } else if (actionType === "order") {
      setIsOrderDialogOpen(true);
    }
  };

  const handleProjectCreated = (project: any) => {
    addProject({
      name: project.name,
      client: project.client,
      status: "Active",
      orders: 0,
      budget: project.budget || "₹0",
      createdDate: new Date().toLocaleDateString("en-GB"),
      dueDate: project.dueDate,
      progress: 0,
      projectId: project.projectId
    });
  };

  return (
    <>
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-2">Quick Actions</h2>
        <p className="text-sm text-muted-foreground mb-6">Frequently used functions for faster workflow</p>
        
        <div className="space-y-3">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action.action)}
              className="w-full p-4 rounded-lg border border-border hover:border-primary/50 hover:shadow-sm transition-all duration-200 flex items-start gap-4 group"
            >
              <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <CreateProjectDialog 
        open={isProjectDialogOpen} 
        onOpenChange={setIsProjectDialogOpen}
        onProjectCreated={handleProjectCreated}
      />

      <CreateOrderDialog 
        open={isOrderDialogOpen} 
        onOpenChange={setIsOrderDialogOpen}
      />
    </>
  );
}
