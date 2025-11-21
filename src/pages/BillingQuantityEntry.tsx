import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, FileText, Download, Columns, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface WorkEntry {
  id: string;
  itemDescription: string;
  area: string;
  length: number;
  breadth: number;
  height: number;
  qty: number;
  total: number;
}

const BillingQuantityEntry = () => {
  const { projectId, orderId, itemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const item = location.state?.item;

  const [measureLabels, setMeasureLabels] = useState({
    measure1: "Length",
    measure2: "Breadth",
    measure3: "Height",
  });

  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([
    { id: "1", itemDescription: "", area: "", length: 0, breadth: 0, height: 0, qty: 0, total: 0 },
    { id: "2", itemDescription: "", area: "", length: 0, breadth: 0, height: 0, qty: 0, total: 0 },
    { id: "3", itemDescription: "", area: "", length: 0, breadth: 0, height: 0, qty: 0, total: 0 },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [isLabelsOpen, setIsLabelsOpen] = useState(true);

  const addRow = () => {
    const newEntry: WorkEntry = {
      id: Date.now().toString(),
      itemDescription: "",
      area: "",
      length: 0,
      breadth: 0,
      height: 0,
      qty: 0,
      total: 0,
    };
    setWorkEntries([...workEntries, newEntry]);
  };

  const deleteRow = (id: string) => {
    setWorkEntries(workEntries.filter((entry) => entry.id !== id));
  };

  const updateEntry = (id: string, field: keyof WorkEntry, value: any) => {
    setWorkEntries(
      workEntries.map((entry) => {
        if (entry.id === id) {
          const updated = { ...entry, [field]: value };
          // Calculate total based on the formula
          const length = field === "length" ? parseFloat(value) || 0 : entry.length;
          const breadth = field === "breadth" ? parseFloat(value) || 0 : entry.breadth;
          const height = field === "height" ? parseFloat(value) || 0 : entry.height;
          const qty = field === "qty" ? parseFloat(value) || 0 : entry.qty;
          
          updated.total = length * breadth * height * qty;
          return updated;
        }
        return entry;
      })
    );
  };

  const filteredEntries = workEntries.filter((entry) => {
    const matchesSearch = entry.itemDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = areaFilter === "all" || entry.area === areaFilter;
    return matchesSearch && matchesArea;
  });

  const uniqueAreas = Array.from(new Set(workEntries.map((e) => e.area).filter(Boolean)));
  
  // Calculate subtotals by area
  const subtotalsByArea = workEntries.reduce((acc, entry) => {
    const area = entry.area || "No Area";
    if (!acc[area]) {
      acc[area] = 0;
    }
    acc[area] += entry.total;
    return acc;
  }, {} as Record<string, number>);

  const grandTotal = workEntries.reduce((sum, entry) => sum + entry.total, 0);

  // Calculate milestone totals based on item milestones
  const milestoneCalculations = item?.milestones?.map((milestone: any) => ({
    name: milestone.name,
    percentage: milestone.percentage,
    amount: (grandTotal * milestone.percentage) / 100,
  })) || [];

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

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Billing Quantity Entry</h1>
            <p className="text-muted-foreground">Record and calculate measurements for executed works</p>
          </div>

          {item && (
            <Card className="p-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Item: </span>
                  <span className="font-semibold text-foreground">{item.description}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Department: </span>
                  <span className="font-semibold text-foreground">{item.department}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Unit: </span>
                  <span className="font-semibold text-foreground">{item.unitOfMeasurement}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount: </span>
                  <span className="font-semibold text-primary">₹{item.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-6 mb-6">
            <Collapsible open={isLabelsOpen} onOpenChange={setIsLabelsOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Measurement Labels</h3>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Measure 1
                    </label>
                    <Input
                      value={measureLabels.measure1}
                      onChange={(e) => setMeasureLabels({ ...measureLabels, measure1: e.target.value })}
                      placeholder="e.g., Length"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Measure 2
                    </label>
                    <Input
                      value={measureLabels.measure2}
                      onChange={(e) => setMeasureLabels({ ...measureLabels, measure2: e.target.value })}
                      placeholder="e.g., Breadth"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Measure 3
                    </label>
                    <Input
                      value={measureLabels.measure3}
                      onChange={(e) => setMeasureLabels({ ...measureLabels, measure3: e.target.value })}
                      placeholder="e.g., Height"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-foreground text-lg">Work Entries</h3>
                <p className="text-sm text-muted-foreground">Click empty cells or double-click to edit</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-muted-foreground">Total Quantity</span>
                <span className="text-2xl font-bold text-primary">{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Input
                  placeholder="Search by item description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <Select value={areaFilter} onValueChange={setAreaFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {uniqueAreas.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Columns className="w-4 h-4" />
                Add Column
              </Button>
              <Button onClick={addRow} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Row
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12 font-semibold">SR.</TableHead>
                    <TableHead className="min-w-[200px] font-semibold">ITEM DESCRIPTION</TableHead>
                    <TableHead className="min-w-[120px] font-semibold">AREA</TableHead>
                    <TableHead className="w-[100px] font-semibold text-center">{measureLabels.measure1.toUpperCase()}</TableHead>
                    <TableHead className="w-[100px] font-semibold text-center">{measureLabels.measure2.toUpperCase()}</TableHead>
                    <TableHead className="w-[100px] font-semibold text-center">{measureLabels.measure3.toUpperCase()}</TableHead>
                    <TableHead className="w-[80px] font-semibold text-center">QTY</TableHead>
                    <TableHead className="w-[120px] font-semibold text-right">TOTAL</TableHead>
                    {item?.milestones?.map((milestone: any, index: number) => (
                      <TableHead key={index} className="w-[120px] font-semibold text-right">
                        {milestone.name.toUpperCase()} ({milestone.percentage}%)
                      </TableHead>
                    ))}
                    <TableHead className="w-[80px] font-semibold text-center">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry, index) => (
                    <TableRow key={entry.id} className="hover:bg-muted/30">
                      <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          value={entry.itemDescription}
                          onChange={(e) => updateEntry(entry.id, "itemDescription", e.target.value)}
                          placeholder="Enter description..."
                          className="border-0 bg-transparent"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={entry.area}
                          onChange={(e) => updateEntry(entry.id, "area", e.target.value)}
                          placeholder="Area..."
                          className="border-0 bg-transparent"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={entry.length || ""}
                          onChange={(e) => updateEntry(entry.id, "length", e.target.value)}
                          className="border-0 bg-transparent text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={entry.breadth || ""}
                          onChange={(e) => updateEntry(entry.id, "breadth", e.target.value)}
                          className="border-0 bg-transparent text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={entry.height || ""}
                          onChange={(e) => updateEntry(entry.id, "height", e.target.value)}
                          className="border-0 bg-transparent text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={entry.qty || ""}
                          onChange={(e) => updateEntry(entry.id, "qty", e.target.value)}
                          className="border-0 bg-transparent text-center"
                        />
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {entry.total.toFixed(2)}
                      </TableCell>
                      {item?.milestones?.map((milestone: any, index: number) => (
                        <TableCell key={index} className="text-right font-medium text-muted-foreground">
                          {((entry.total * milestone.percentage) / 100).toFixed(2)}
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRow(entry.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {Object.entries(subtotalsByArea).map(([area, total]) => (
                    <TableRow key={`subtotal-${area}`} className="bg-muted/30 font-semibold">
                      <TableCell colSpan={7} className="text-foreground">
                        Subtotal - {area}
                      </TableCell>
                      <TableCell className="text-right text-blue-600">
                        {total.toFixed(2)}
                      </TableCell>
                      {item?.milestones?.map((milestone: any, index: number) => (
                        <TableCell key={index} className="text-right text-blue-600">
                          {((total * milestone.percentage) / 100).toFixed(2)}
                        </TableCell>
                      ))}
                      <TableCell />
                    </TableRow>
                  ))}
                  
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={7} className="text-foreground text-lg">
                      GRAND TOTAL
                    </TableCell>
                    <TableCell className="text-right text-primary text-lg">
                      {grandTotal.toFixed(2)}
                    </TableCell>
                    {item?.milestones?.map((milestone: any, index: number) => (
                      <TableCell key={index} className="text-right text-primary text-lg">
                        {((grandTotal * milestone.percentage) / 100).toFixed(2)}
                      </TableCell>
                    ))}
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Card>

          {milestoneCalculations.length > 0 && (
            <Card className="p-6 mt-6">
              <h3 className="font-semibold text-foreground text-lg mb-4">Payment Milestones</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {milestoneCalculations.map((milestone, index) => (
                  <div key={index} className="p-4 rounded-lg border border-border">
                    <div className="text-sm text-muted-foreground mb-1">{milestone.name}</div>
                    <div className="text-2xl font-bold text-foreground">{milestone.amount.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground mt-1">{milestone.percentage}% of total</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default BillingQuantityEntry;
