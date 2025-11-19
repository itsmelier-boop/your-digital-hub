import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Search, Columns3, Group, FormInput } from "lucide-react";

interface SpoolRow {
  id: string;
  area: string;
  drawingNo: string;
  revNo: string;
  sheetNo: string;
  spoolNo: string;
  lineSize: string;
  baseMaterial: string;
  length: number;
  inchMeter: number;
  surfaceArea: number;
  paintSystem: string;
  remarks: string;
}

const PipingSpoolStatus = () => {
  const { projectId, orderId, itemId } = useParams<{ 
    projectId: string; 
    orderId: string;
    itemId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const item = location.state?.item;

  const [rows, setRows] = useState<SpoolRow[]>([
    {
      id: "1",
      area: "A1",
      drawingNo: "DWG-001",
      revNo: "R1",
      sheetNo: "1",
      spoolNo: "SP01",
      lineSize: "2",
      baseMaterial: "CS,SS304",
      length: 0.4865,
      inchMeter: 0.973,
      surfaceArea: 0.098,
      paintSystem: "3.2",
      remarks: ""
    },
    {
      id: "2",
      area: "A1",
      drawingNo: "DWG-001",
      revNo: "R1",
      sheetNo: "1",
      spoolNo: "SP02",
      lineSize: "1",
      baseMaterial: "CS",
      length: 5.336,
      inchMeter: 5.336,
      surfaceArea: 0.561,
      paintSystem: "3.2",
      remarks: ""
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [paintSystemValue, setPaintSystemValue] = useState("3.2");

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

  const addRow = () => {
    const newRow: SpoolRow = {
      id: String(Date.now()),
      area: "",
      drawingNo: "",
      revNo: "",
      sheetNo: "",
      spoolNo: "",
      lineSize: "",
      baseMaterial: "",
      length: 0,
      inchMeter: 0,
      surfaceArea: 0,
      paintSystem: paintSystemValue,
      remarks: ""
    };
    setRows([...rows, newRow]);
  };

  const updateRow = (id: string, field: keyof SpoolRow, value: any) => {
    setRows(rows.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        return updatedRow;
      }
      return row;
    }));
  };

  const applyPaintSystemToAll = () => {
    setRows(rows.map(row => ({ ...row, paintSystem: paintSystemValue })));
  };

  // Calculate milestone values based on total surface area
  const totalSurfaceArea = rows.reduce((sum, row) => sum + row.surfaceArea, 0);
  
  const milestoneValues = item.milestones.map((milestone: any) => ({
    ...milestone,
    value: (totalSurfaceArea * milestone.percentage) / 100
  }));

  const filteredRows = rows.filter(row => 
    Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      
      <main className="ml-64 pt-16">
        <div className="p-6">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(`/projects/${projectId}/orders/${orderId}`)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Items
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold text-foreground">Engineering Data Manager</h1>
              <p className="text-muted-foreground mt-1">
                Manage and analyze drawing, spool, and material specifications
              </p>
            </div>
          </div>

          <Card className="p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Item Description:</span>
                <span className="ml-2 font-medium text-foreground">{item.description}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Item Code:</span>
                <span className="ml-2 font-medium text-foreground">{item.itemCode}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Department:</span>
                <span className="ml-2 font-medium text-foreground">{item.department}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Order ID:</span>
                <span className="ml-2 font-medium text-foreground">{orderId}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search all columns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Paint System:</span>
                <Input
                  value={paintSystemValue}
                  onChange={(e) => setPaintSystemValue(e.target.value)}
                  className="w-20"
                />
                <Button variant="outline" size="sm" onClick={applyPaintSystemToAll}>
                  Apply to All
                </Button>
              </div>

              <Button variant="outline" size="sm">
                <Columns3 className="h-4 w-4 mr-2" />
                Columns
              </Button>

              <Button variant="outline" size="sm">
                <Group className="h-4 w-4 mr-2" />
                Group By
              </Button>

              <Button onClick={addRow} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Row
              </Button>

              <Button variant="outline" size="sm">
                <FormInput className="h-4 w-4 mr-2" />
                Add via Form
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium text-foreground min-w-[100px]">Area</th>
                    <th className="p-3 text-left text-sm font-medium text-foreground min-w-[120px]">Drawing No</th>
                    <th className="p-3 text-left text-sm font-medium text-foreground min-w-[100px]">RevNo</th>
                    <th className="p-3 text-left text-sm font-medium text-foreground min-w-[100px]">SheetNo</th>
                    <th className="p-3 text-left text-sm font-medium text-foreground min-w-[120px]">SpoolNo</th>
                    <th className="p-3 text-left text-sm font-medium text-foreground min-w-[100px]">Line Size</th>
                    <th className="p-3 text-left text-sm font-medium text-foreground min-w-[140px]">BaseMaterial</th>
                    <th className="p-3 text-left text-sm font-medium text-foreground min-w-[100px]">length</th>
                    <th className="p-3 text-left text-sm font-medium text-foreground min-w-[120px]">InchMeter</th>
                    <th className="p-3 text-left text-sm font-medium text-foreground min-w-[130px]">SurfaceArea</th>
                    <th className="p-3 text-left text-sm font-medium text-foreground min-w-[120px]">PaintSystem</th>
                    <th className="p-3 text-left text-sm font-medium text-foreground min-w-[150px]">Remarks</th>
                    {milestoneValues.map((milestone: any) => (
                      <th key={milestone.name} className="p-3 text-left text-sm font-medium text-foreground min-w-[120px]">
                        {milestone.name}
                      </th>
                    ))}
                    <th className="p-3 text-left text-sm font-medium text-foreground min-w-[100px]">Actions</th>
                  </tr>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-2">
                      <Input placeholder="Filter Area..." className="h-8 text-xs" />
                    </th>
                    <th className="p-2">
                      <Input placeholder="Filter Drawing..." className="h-8 text-xs" />
                    </th>
                    <th className="p-2">
                      <Input placeholder="Filter RevNo..." className="h-8 text-xs" />
                    </th>
                    <th className="p-2">
                      <Input placeholder="Filter SheetNo..." className="h-8 text-xs" />
                    </th>
                    <th className="p-2">
                      <Input placeholder="Filter SpoolNo..." className="h-8 text-xs" />
                    </th>
                    <th className="p-2">
                      <Input placeholder="Filter Line Size..." className="h-8 text-xs" />
                    </th>
                    <th className="p-2">
                      <Input placeholder="Filter BaseMater..." className="h-8 text-xs" />
                    </th>
                    <th className="p-2">
                      <Input placeholder="Filter length..." className="h-8 text-xs" />
                    </th>
                    <th className="p-2">
                      <Input placeholder="Filter InchMete..." className="h-8 text-xs" />
                    </th>
                    <th className="p-2">
                      <Input placeholder="Filter SurfaceAr..." className="h-8 text-xs" />
                    </th>
                    <th className="p-2">
                      <Input placeholder="Filter PaintSyst..." className="h-8 text-xs" />
                    </th>
                    <th className="p-2">
                      <Input placeholder="Filter Remarks..." className="h-8 text-xs" />
                    </th>
                    {milestoneValues.map((milestone: any) => (
                      <th key={`filter-${milestone.name}`} className="p-2">
                        <Input placeholder={`Filter ${milestone.name}...`} className="h-8 text-xs" />
                      </th>
                    ))}
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr key={row.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-2">
                        <Input
                          value={row.area}
                          onChange={(e) => updateRow(row.id, 'area', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={row.drawingNo}
                          onChange={(e) => updateRow(row.id, 'drawingNo', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={row.revNo}
                          onChange={(e) => updateRow(row.id, 'revNo', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={row.sheetNo}
                          onChange={(e) => updateRow(row.id, 'sheetNo', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={row.spoolNo}
                          onChange={(e) => updateRow(row.id, 'spoolNo', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={row.lineSize}
                          onChange={(e) => updateRow(row.id, 'lineSize', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={row.baseMaterial}
                          onChange={(e) => updateRow(row.id, 'baseMaterial', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={row.length}
                          onChange={(e) => updateRow(row.id, 'length', parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm"
                          step="0.001"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={row.inchMeter}
                          onChange={(e) => updateRow(row.id, 'inchMeter', parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm"
                          step="0.001"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={row.surfaceArea}
                          onChange={(e) => updateRow(row.id, 'surfaceArea', parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm"
                          step="0.001"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={row.paintSystem}
                          onChange={(e) => updateRow(row.id, 'paintSystem', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={row.remarks}
                          onChange={(e) => updateRow(row.id, 'remarks', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </td>
                      {milestoneValues.map((milestone: any) => (
                        <td key={`${row.id}-${milestone.name}`} className="p-2 text-sm text-foreground">
                          {((row.surfaceArea * milestone.percentage) / 100).toFixed(3)}
                        </td>
                      ))}
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRows(rows.filter(r => r.id !== row.id))}
                          className="h-8"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/70">
                    <td colSpan={9} className="p-3 text-right font-semibold text-foreground">
                      Totals:
                    </td>
                    <td className="p-3 font-semibold text-foreground">
                      {totalSurfaceArea.toFixed(3)}
                    </td>
                    <td className="p-3"></td>
                    <td className="p-3"></td>
                    {milestoneValues.map((milestone: any) => (
                      <td key={`total-${milestone.name}`} className="p-3 font-semibold text-foreground">
                        {milestone.value.toFixed(3)}
                      </td>
                    ))}
                    <td className="p-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PipingSpoolStatus;
