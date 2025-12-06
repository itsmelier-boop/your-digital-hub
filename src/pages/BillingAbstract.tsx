import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, FileText, Printer } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMeasurements } from "@/contexts/MeasurementContext";
import { useOrders } from "@/contexts/OrderContext";

// Mock items data - in production, this would come from context/API
const mockItemsData: Record<string, any[]> = {
  "ORD-001": [
    {
      id: "1",
      code: "STR-001",
      description: "Structural Steel Work - Main Building",
      department: "Structure",
      unitOfMeasurement: "MT",
      quantity: 150,
      unitRate: 85000,
      amount: 12750000,
      milestones: [
        { id: "1", name: "Supply", percentage: 60 },
        { id: "2", name: "Erection", percentage: 40 },
      ],
    },
    {
      id: "2",
      code: "PIP-001",
      description: "Piping Work - Process Lines",
      department: "Piping-LHS",
      unitOfMeasurement: "RM",
      quantity: 500,
      unitRate: 2500,
      amount: 1250000,
      milestones: [
        { id: "1", name: "Fabrication", percentage: 50 },
        { id: "2", name: "Installation", percentage: 50 },
      ],
    },
  ],
  "ORD-002": [
    {
      id: "1",
      code: "FND-001",
      description: "Foundation Work",
      department: "Structure",
      unitOfMeasurement: "CUM",
      quantity: 25.678,
      unitRate: 11430,
      amount: 293427,
      milestones: [
        { id: "1", name: "Excavation", percentage: 30 },
        { id: "2", name: "Concrete", percentage: 70 },
      ],
    },
  ],
};

const BillingAbstract = () => {
  const { projectId, orderId } = useParams<{ projectId: string; orderId: string }>();
  const navigate = useNavigate();
  const { measurements, getMeasurementSheet } = useMeasurements();
  const { orders } = useOrders();

  const order = orders.find(o => o.id === orderId);
  const items = mockItemsData[orderId || ""] || [];

  // Calculate measured quantities and amounts for each item
  const abstractData = items.map(item => {
    const sheet = getMeasurementSheet(projectId || "", orderId || "", item.id);
    const measuredQty = sheet?.rows.reduce((sum, row) => sum + row.weight, 0) || 0;
    const measuredAmount = measuredQty * item.unitRate;
    
    // Calculate milestone-wise amounts
    const milestoneAmounts = item.milestones.map((milestone: any) => ({
      ...milestone,
      billAmount: (measuredAmount * milestone.percentage) / 100,
    }));

    return {
      ...item,
      measuredQty,
      measuredAmount,
      milestoneAmounts,
      progressPercentage: item.quantity > 0 ? (measuredQty / item.quantity) * 100 : 0,
    };
  });

  // Calculate totals
  const totals = abstractData.reduce(
    (acc, item) => ({
      orderAmount: acc.orderAmount + item.amount,
      measuredAmount: acc.measuredAmount + item.measuredAmount,
      measuredQty: acc.measuredQty + item.measuredQty,
    }),
    { orderAmount: 0, measuredAmount: 0, measuredQty: 0 }
  );

  // Get all unique milestones across items
  const allMilestones = Array.from(
    new Set(items.flatMap((item: any) => item.milestones.map((m: any) => m.name)))
  );

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Create CSV content
    let csvContent = "Sr No,Description,Department,Unit,Order Qty,Order Amount,Measured Qty,Measured Amount,Progress %\n";
    
    abstractData.forEach((item, index) => {
      csvContent += `${index + 1},"${item.description}",${item.department},${item.unitOfMeasurement},${item.quantity},${item.amount},${item.measuredQty.toFixed(3)},${item.measuredAmount.toFixed(2)},${item.progressPercentage.toFixed(1)}%\n`;
    });
    
    csvContent += `\nTotals,,,,,${totals.orderAmount},${totals.measuredQty.toFixed(3)},${totals.measuredAmount.toFixed(2)},\n`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `billing-abstract-${orderId}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
            onClick={() => navigate(`/projects/${projectId}/orders/${orderId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Items
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Billing Abstract</h1>
              <p className="text-muted-foreground">
                {order?.name} • Order #{orderId}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={handlePrint}>
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleExport}>
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Order Value</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(totals.orderAmount)}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-muted-foreground">Bill Amount</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totals.measuredAmount)}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-muted-foreground">Measured Qty</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {totals.measuredQty.toFixed(3)}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-muted-foreground">Progress</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {totals.orderAmount > 0
                  ? ((totals.measuredAmount / totals.orderAmount) * 100).toFixed(1)
                  : 0}%
              </div>
            </Card>
          </div>

          {/* Abstract Table */}
          <Card className="overflow-hidden print:shadow-none">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-foreground">Abstract of Billing</h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12 font-semibold text-center">Sr.</TableHead>
                    <TableHead className="min-w-[250px] font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Dept.</TableHead>
                    <TableHead className="font-semibold text-center">Unit</TableHead>
                    <TableHead className="font-semibold text-right">Order Qty</TableHead>
                    <TableHead className="font-semibold text-right">Rate</TableHead>
                    <TableHead className="font-semibold text-right">Order Amt</TableHead>
                    <TableHead className="font-semibold text-right">Meas. Qty</TableHead>
                    <TableHead className="font-semibold text-right">Bill Amt</TableHead>
                    <TableHead className="font-semibold text-center">Progress</TableHead>
                    {allMilestones.map((milestone) => (
                      <TableHead key={milestone} className="font-semibold text-right min-w-[100px]">
                        {milestone}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {abstractData.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="text-center text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">
                            {item.code}
                          </div>
                          <div className="font-medium text-foreground">{item.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal text-xs">
                          {item.department}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {item.unitOfMeasurement}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity.toLocaleString("en-IN", { minimumFractionDigits: 3 })}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{item.unitRate.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {item.measuredQty.toFixed(3)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        {formatCurrency(item.measuredAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={item.progressPercentage >= 100 ? "default" : "secondary"}
                          className={
                            item.progressPercentage >= 100
                              ? "bg-green-500"
                              : item.progressPercentage > 50
                              ? "bg-blue-500 text-white"
                              : ""
                          }
                        >
                          {item.progressPercentage.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      {allMilestones.map((milestoneName) => {
                        const milestone = item.milestoneAmounts.find(
                          (m: any) => m.name === milestoneName
                        );
                        return (
                          <TableCell key={milestoneName} className="text-right text-sm">
                            {milestone ? formatCurrency(milestone.billAmount) : "-"}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}

                  {/* Totals Row */}
                  <TableRow className="bg-muted/50 font-bold border-t-2 border-border">
                    <TableCell colSpan={6} className="text-foreground text-lg">
                      TOTAL
                    </TableCell>
                    <TableCell className="text-right text-lg text-foreground">
                      {formatCurrency(totals.orderAmount)}
                    </TableCell>
                    <TableCell className="text-right text-lg text-primary">
                      {totals.measuredQty.toFixed(3)}
                    </TableCell>
                    <TableCell className="text-right text-lg text-green-600">
                      {formatCurrency(totals.measuredAmount)}
                    </TableCell>
                    <TableCell className="text-center text-lg">
                      {totals.orderAmount > 0
                        ? ((totals.measuredAmount / totals.orderAmount) * 100).toFixed(1)
                        : 0}%
                    </TableCell>
                    {allMilestones.map((milestoneName) => {
                      const milestoneTotal = abstractData.reduce((sum, item) => {
                        const milestone = item.milestoneAmounts.find(
                          (m: any) => m.name === milestoneName
                        );
                        return sum + (milestone?.billAmount || 0);
                      }, 0);
                      return (
                        <TableCell key={milestoneName} className="text-right font-bold">
                          {formatCurrency(milestoneTotal)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Print Styles Note */}
          <p className="text-sm text-muted-foreground mt-4 print:hidden">
            Use the Print button to generate a printable version of this abstract.
          </p>
        </div>
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          .ml-64 {
            margin-left: 0 !important;
          }
          .pt-16 {
            padding-top: 0 !important;
          }
          aside, header, button, .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BillingAbstract;
