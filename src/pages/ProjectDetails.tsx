import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Eye, Pencil, Trash2, FileText, DollarSign, Package } from "lucide-react";

// Mock data - in a real app, this would come from a database/API
const projectsData = {
  "1": {
    id: 1,
    name: "Shivam Enterprises Project",
    client: "Shivam Enterprises",
    orders: [
      {
        id: "ORD-001",
        name: "Main Construction Work",
        description: "Primary construction activities including structure, piping and cable tray work",
        status: "Active",
        items: 2,
        amount: "₹60,25,000",
        createdDate: "10/18/2025"
      }
    ]
  },
  "2": {
    id: 2,
    name: "FG",
    client: "DCV",
    orders: [
      {
        id: "ORD-002",
        name: "Initial Setup Work",
        description: "Foundation and basic infrastructure setup",
        status: "Active",
        items: 1,
        amount: "₹2,93,427",
        createdDate: "11/9/2025"
      }
    ]
  }
};

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const project = projectsData[projectId as keyof typeof projectsData];

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Project Not Found</h1>
          <Button onClick={() => navigate("/projects")}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  const totalOrders = project.orders.length;
  const totalAmount = project.orders.reduce((sum, order) => {
    const amount = parseInt(order.amount.replace(/[₹,]/g, ""));
    return sum + amount;
  }, 0);
  const totalItems = project.orders.reduce((sum, order) => sum + order.items, 0);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      
      <main className="ml-64 pt-16">
        <div className="p-8">
          <Button
            variant="ghost"
            className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{project.name}</h1>
              <p className="text-muted-foreground">Orders for {project.client}</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="w-5 h-5" />
              Add Order
            </Button>
          </div>

          <div className="space-y-6 mb-8">
            {project.orders.map((order) => (
              <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">{order.name}</h3>
                      <Badge className="bg-success text-success-foreground">{order.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Order #{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Items</p>
                    <p className="text-lg font-semibold text-foreground">{order.items}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Amount</p>
                    <p className="text-lg font-semibold text-primary">{order.amount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Eye className="w-4 h-4" />
                    View Items
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
                  <p className="text-xs text-muted-foreground">Created {order.createdDate}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">₹{totalAmount.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalItems}</p>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetails;
