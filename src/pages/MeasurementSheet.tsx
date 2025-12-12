import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, X, Calculator } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMeasurements, MeasurementRow } from "@/contexts/MeasurementContext";

const MeasurementSheet = () => {
  const { projectId, orderId, itemId } = useParams<{ 
    projectId: string; 
    orderId: string;
    itemId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const item = location.state?.item;
  const { getMeasurementSheet, updateMeasurementSheet } = useMeasurements();

  // Load measurement sheet from context or initialize with default row
  const existingSheet = getMeasurementSheet(projectId || "", orderId || "", itemId || "");
  const [rows, setRows] = useState<MeasurementRow[]>(
    existingSheet?.rows || [
      {
        id: "1",
        checked: false,
        type: "Column",
        markNo: "C1",
        unitWeight: 1.05,
        length: null,
        width: null,
        thickness: null,
        qty: 2,
        weight: 2.100
      }
    ]
  );

  // Save to context whenever rows change
  useEffect(() => {
    if (projectId && orderId && itemId) {
      updateMeasurementSheet(projectId, orderId, itemId, rows);
    }
  }, [rows, projectId, orderId, itemId, updateMeasurementSheet]);

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Item Not Found</h1>
          <Button onClick={() => navigate(`/projects/${projectId}/orders/${orderId}`)}>
            Back to Items
          </Button>
        </div>
      </div>
    );
  }

  const addRows = (count: number) => {
    const newRows = Array.from({ length: count }, (_, i) => ({
      id: String(rows.length + i + 1),
      checked: false,
      type: "",
      markNo: "",
      unitWeight: 0,
      length: null,
      width: null,
      thickness: null,
      qty: 0,
      weight: 0
    }));
    setRows([...rows, ...newRows]);
  };

  const deleteRow = (id: string) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const updateRow = (id: string, field: keyof MeasurementRow, value: any) => {
    setRows(rows.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        
        // Auto-calculate weight if relevant fields change
        if (['unitWeight', 'length', 'width', 'thickness', 'qty'].includes(field)) {
          const weight = calculateWeight(updatedRow);
          updatedRow.weight = weight;
        }
        
        return updatedRow;
      }
      return row;
    }));
  };

  const calculateWeight = (row: MeasurementRow) => {
    const { unitWeight, length, width, thickness, qty } = row;
    let weight = unitWeight * qty;
    
    if (length !== null) weight *= length;
    if (width !== null) weight *= width;
    if (thickness !== null) weight *= thickness;
    
    return parseFloat(weight.toFixed(3));
  };

  const totalWeight = rows.reduce((sum, row) => sum + row.weight, 0);
  
  // Calculate milestone weights based on item's milestones
  const milestoneWeights = item.milestones.map((milestone: any) => ({
    ...milestone,
    weight: (totalWeight * milestone.percentage) / 100
  }));

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
            onClick={() => navigate(`/projects/${projectId}/orders/${orderId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Items
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Measurement Sheet</h1>
            <p className="text-muted-foreground">
              {item.description} • {item.department} • Order #{orderId}
            </p>
          </div>

          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Item Details</h3>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Quantity</p>
                <p className="text-lg font-semibold text-foreground">
                  {item.quantity} {item.unitOfMeasurement}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Unit Rate</p>
                <p className="text-lg font-semibold text-foreground">
                  ₹{item.unitRate.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                <p className="text-lg font-semibold text-primary">
                  {formatCurrency(item.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Measured Weight</p>
                <p className="text-lg font-semibold text-foreground">
                  {totalWeight.toFixed(3)} {item.unitOfMeasurement}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Measurement Data</h3>
                <p className="text-sm text-muted-foreground">
                  Excel-like measurement tracking with billing milestones
                </p>
              </div>
              <Button 
                onClick={() => addRows(10)}
                className="bg-primary hover:bg-primary/90 gap-2"
              >
                <Plus className="w-4 h-4" />
                Add 10 Rows
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border p-2 text-sm font-semibold text-foreground w-12">#</th>
                    <th className="border border-border p-2 text-sm font-semibold text-foreground w-16">Check</th>
                    <th className="border border-border p-2 text-sm font-semibold text-foreground w-32">Type</th>
                    <th className="border border-border p-2 text-sm font-semibold text-foreground w-24">Mark No.</th>
                    <th className="border border-border p-2 text-sm font-semibold text-foreground w-28">Unit Weight</th>
                    <th className="border border-border p-2 text-sm font-semibold text-foreground w-24">Length</th>
                    <th className="border border-border p-2 text-sm font-semibold text-foreground w-24">Width</th>
                    <th className="border border-border p-2 text-sm font-semibold text-foreground w-28">Thickness</th>
                    <th className="border border-border p-2 text-sm font-semibold text-foreground w-20">Qty</th>
                    <th className="border border-border p-2 text-sm font-semibold text-foreground w-24">Weight</th>
                    {milestoneWeights.map((milestone: any) => (
                      <th key={milestone.id} className="border border-border p-2 text-sm font-semibold text-foreground w-28">
                        <div>{milestone.percentage}%</div>
                        <div className="text-xs font-normal text-muted-foreground">{milestone.name}</div>
                      </th>
                    ))}
                    <th className="border border-border p-2 text-sm font-semibold text-foreground w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.id} className="hover:bg-muted/20">
                      <td className="border border-border p-2 text-center text-sm text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="border border-border p-2 text-center">
                        <Checkbox
                          checked={row.checked}
                          onCheckedChange={(checked) => 
                            updateRow(row.id, 'checked', checked)
                          }
                        />
                      </td>
                      <td className="border border-border p-2">
                        <Select
                          value={row.type}
                          onValueChange={(value) => updateRow(row.id, 'type', value)}
                        >
                          <SelectTrigger className="h-8 text-sm border-0 focus:ring-0">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Column">Column</SelectItem>
                            <SelectItem value="Beam">Beam</SelectItem>
                            <SelectItem value="Slab">Slab</SelectItem>
                            <SelectItem value="Foundation">Foundation</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border border-border p-2">
                        <Input
                          type="text"
                          value={row.markNo}
                          onChange={(e) => updateRow(row.id, 'markNo', e.target.value)}
                          className="h-8 text-sm border-0 focus-visible:ring-0"
                        />
                      </td>
                      <td className="border border-border p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={row.unitWeight || ''}
                          onChange={(e) => updateRow(row.id, 'unitWeight', parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm border-0 focus-visible:ring-0 text-right"
                        />
                      </td>
                      <td className="border border-border p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={row.length ?? ''}
                          onChange={(e) => updateRow(row.id, 'length', e.target.value ? parseFloat(e.target.value) : null)}
                          className="h-8 text-sm border-0 focus-visible:ring-0 text-center"
                          placeholder="-"
                        />
                      </td>
                      <td className="border border-border p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={row.width ?? ''}
                          onChange={(e) => updateRow(row.id, 'width', e.target.value ? parseFloat(e.target.value) : null)}
                          className="h-8 text-sm border-0 focus-visible:ring-0 text-center"
                          placeholder="-"
                        />
                      </td>
                      <td className="border border-border p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={row.thickness ?? ''}
                          onChange={(e) => updateRow(row.id, 'thickness', e.target.value ? parseFloat(e.target.value) : null)}
                          className="h-8 text-sm border-0 focus-visible:ring-0 text-center"
                          placeholder="-"
                        />
                      </td>
                      <td className="border border-border p-2">
                        <Input
                          type="number"
                          value={row.qty || ''}
                          onChange={(e) => updateRow(row.id, 'qty', parseInt(e.target.value) || 0)}
                          className="h-8 text-sm border-0 focus-visible:ring-0 text-center"
                        />
                      </td>
                      <td className="border border-border p-2 text-right text-sm font-medium text-foreground">
                        {row.weight.toFixed(3)}
                      </td>
                      {milestoneWeights.map((milestone: any) => (
                        <td key={milestone.id} className="border border-border p-1">
                          <Input
                            type="text"
                            value={row.milestoneEntries?.[milestone.id] ?? ''}
                            onChange={(e) => {
                              const value = e.target.value || undefined;
                              const newEntries = { ...row.milestoneEntries, [milestone.id]: value };
                              if (value === undefined) delete newEntries[milestone.id];
                              updateRow(row.id, 'milestoneEntries', newEntries);
                            }}
                            className="h-8 text-sm border-0 focus-visible:ring-0 text-center w-full"
                            placeholder="-"
                          />
                        </td>
                      ))}
                      <td className="border border-border p-2 text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteRow(row.id)}
                          className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted/50 font-semibold">
                    <td colSpan={9} className="border border-border p-2 text-sm text-foreground">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        Totals
                      </div>
                    </td>
                    <td className="border border-border p-2 text-right text-sm text-foreground">
                      {totalWeight.toFixed(3)}
                    </td>
                    {milestoneWeights.map((milestone: any) => {
                      const milestoneTotal = rows.reduce((sum, row) => {
                        const val = row.milestoneEntries?.[milestone.id];
                        return sum + (val ? parseFloat(val) || 0 : 0);
                      }, 0);
                      return (
                        <td key={milestone.id} className="border border-border p-2 text-center text-sm font-bold" 
                            style={{ color: milestone.name.toLowerCase().includes('supply') ? '#16a34a' : '#9333ea' }}>
                          {milestoneTotal > 0 ? milestoneTotal.toFixed(3) : '-'}
                        </td>
                      );
                    })}
                    <td className="border border-border p-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MeasurementSheet;
