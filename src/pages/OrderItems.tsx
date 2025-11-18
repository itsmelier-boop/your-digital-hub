import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Package, Pencil, Trash2, Eye, DollarSign, Boxes } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateItemDialog } from "@/components/CreateItemDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  const totalAmount = items.reduce((sum: number, item: any) => sum + item.amount, 0);
  const uniqueDepartments = new Set(items.map((item: any) => item.department)).size;
  const averageAmount = items.length > 0 ? totalAmount / items.length : 0;

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

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
            <>
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12 font-semibold">#</TableHead>
                      <TableHead className="font-semibold">Description</TableHead>
                      <TableHead className="font-semibold">Department</TableHead>
                      <TableHead className="font-semibold">Unit</TableHead>
                      <TableHead className="text-right font-semibold">Quantity</TableHead>
                      <TableHead className="text-right font-semibold">Unit Rate</TableHead>
                      <TableHead className="text-right font-semibold">Amount</TableHead>
                      <TableHead className="text-center font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedItems.map((item: any, index: number) => (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">
                              {item.code}
                            </div>
                            <div className="font-semibold text-foreground">
                              {item.description}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Milestones: {item.milestones.reduce((sum: number, m: any) => sum + m.percentage, 0)}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal">
                            {item.department}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground font-medium">
                          {item.unitOfMeasurement}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.quantity.toLocaleString('en-IN', { minimumFractionDigits: 3 })}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{item.unitRate.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-primary font-bold text-base">
                            {formatCurrency(item.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 gap-1.5"
                              onClick={() => navigate(`/projects/${projectId}/orders/${orderId}/items/${item.id}/measure`, { 
                                state: { item } 
                              })}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Measure
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 gap-1.5">
                              <Pencil className="w-3.5 h-3.5" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Boxes className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-foreground">
                        {items.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Items
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(totalAmount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Amount
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-foreground">
                        {uniqueDepartments}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Departments
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-foreground">
                        {formatCurrency(averageAmount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Average Amount
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </>
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
