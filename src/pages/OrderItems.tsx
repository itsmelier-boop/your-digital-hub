import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Package, Pencil, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateItemDialog } from "@/components/CreateItemDialog";

// Mock data - in a real app, this would come from a database/API
const ordersData = {
  "ORD-001": {
    id: "ORD-001",
    name: "Main Construction Work",
    projectId: "1",
    projectName: "Shivam Enterprises",
    items: []
  },
  "ORD-002": {
    id: "ORD-002",
    name: "Initial Setup Work",
    projectId: "2",
    projectName: "FG",
    items: []
  }
};

const OrderItems = () => {
  const { projectId, orderId } = useParams<{ projectId: string; orderId: string }>();
  const navigate = useNavigate();
  const [department, setDepartment] = useState("all");
  const [sortBy, setSortBy] = useState("description");
  const [order, setOrder] = useState("ascending");
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);

  const orderData = ordersData[orderId as keyof typeof ordersData];
  const [items, setItems] = useState(orderData?.items || []);

  if (!orderData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Order Not Found</h1>
          <Button onClick={() => navigate(`/projects/${projectId}`)}>Back to Project</Button>
        </div>
      </div>
    );
  }

  const handleItemCreated = (newItem: any) => {
    setItems((prevItems) => [...prevItems, newItem]);
  };

  const filteredItems = items.filter((item: any) => {
    if (department === "all") return true;
    return item.department?.toLowerCase() === department.toLowerCase();
  });

  const sortedItems = [...filteredItems].sort((a: any, b: any) => {
    let comparison = 0;
    
    if (sortBy === "description") {
      comparison = a.description.localeCompare(b.description);
    } else if (sortBy === "amount") {
      comparison = a.amount - b.amount;
    } else if (sortBy === "quantity") {
      comparison = a.quantity - b.quantity;
    } else if (sortBy === "date") {
      comparison = new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
    }
    
    return order === "ascending" ? comparison : -comparison;
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      
      <main className="ml-64 pt-16">
        <div className="p-8">
          <Button
            variant="ghost"
            className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{orderData.name}</h1>
              <p className="text-muted-foreground">Order #{orderId} • {orderData.projectName}</p>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={() => setIsItemDialogOpen(true)}
            >
              <Plus className="w-5 h-5" />
              Add Item
            </Button>
          </div>

          <Card className="p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Filters & Sort</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Department
                </label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="description">Description</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="quantity">Quantity</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Order
                </label>
                <Select value={order} onValueChange={setOrder}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ascending">Ascending</SelectItem>
                    <SelectItem value="descending">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {sortedItems.length === 0 ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Package className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No Items Yet</h3>
                <p className="text-muted-foreground mb-8 max-w-md">
                  Add work items to this order to start tracking measurements and billing.
                </p>
                <Button 
                  className="bg-primary hover:bg-primary/90 gap-2"
                  onClick={() => setIsItemDialogOpen(true)}
                >
                  <Plus className="w-5 h-5" />
                  Add First Item
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedItems.map((item: any) => (
                <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {item.description}
                        </h3>
                        {item.code && (
                          <Badge variant="outline" className="text-xs">
                            {item.code}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.department} • {item.quantity} {item.unitOfMeasurement}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @ ₹{item.unitRate.toLocaleString('en-IN')}/{item.unitOfMeasurement}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-foreground mb-2">Billing Breakup:</p>
                    <div className="space-y-1">
                      {item.milestones.map((milestone: any) => (
                        <div key={milestone.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{milestone.name}</span>
                          <span className="font-medium">{milestone.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Added on {item.createdDate}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateItemDialog
        open={isItemDialogOpen}
        onOpenChange={setIsItemDialogOpen}
        onItemCreated={handleItemCreated}
      />
    </div>
  );
};

export default OrderItems;
