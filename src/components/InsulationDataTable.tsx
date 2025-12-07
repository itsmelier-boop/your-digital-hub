import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import {
  InsulationRow,
  PIPE_SIZES,
  IS_FACTORS,
  INSULATION_TYPES,
  MOC_OPTIONS,
  PAYMENT_MILESTONES,
} from "@/types/piping-insulation";

export const InsulationDataTable = () => {
  const [rows, setRows] = useState<InsulationRow[]>([
    {
      id: crypto.randomUUID(),
      srNo: 1,
      lineNo: "",
      pipeSize: "",
      isFactor: "",
      nps: "",
      length: "",
      area: 0,
      insulationType: "Hot",
      temperature: "",
      thickness: "",
      moc: "Aluminium",
      paymentMilestone: "Not Started",
    },
  ]);

  const calculateArea = useCallback((isFactor: string, length: string): number => {
    const factor = parseFloat(isFactor) || 0;
    const len = parseFloat(length) || 0;
    return factor * len;
  }, []);

  const updateRow = useCallback(
    (id: string, field: keyof InsulationRow, value: any) => {
      setRows((prevRows) =>
        prevRows.map((row) => {
          if (row.id !== id) return row;

          const updatedRow = { ...row, [field]: value };

          // Auto-populate IS Factor when pipe size changes
          if (field === "pipeSize" && value) {
            updatedRow.isFactor = IS_FACTORS[value] || "";
          }

          // Recalculate area
          updatedRow.area = calculateArea(updatedRow.isFactor, updatedRow.length);

          return updatedRow;
        })
      );
    },
    [calculateArea]
  );

  const addRow = () => {
    const newRow: InsulationRow = {
      id: crypto.randomUUID(),
      srNo: rows.length + 1,
      lineNo: "",
      pipeSize: "",
      isFactor: "",
      nps: "",
      length: "",
      area: 0,
      insulationType: "Hot",
      temperature: "",
      thickness: "",
      moc: "Aluminium",
      paymentMilestone: "Not Started",
    };
    setRows([...rows, newRow]);
    toast.success("Row added");
  };

  const deleteRow = (id: string) => {
    if (rows.length === 1) {
      toast.error("Cannot delete the last row");
      return;
    }
    setRows((prevRows) => {
      const filtered = prevRows.filter((row) => row.id !== id);
      return filtered.map((row, index) => ({ ...row, srNo: index + 1 }));
    });
    toast.success("Row deleted");
  };

  const exportToCSV = () => {
    const headers = [
      "Sr No", "Line No", "Pipe Size", "IS Factor", "NPS", "Length (m)", 
      "Area (m²)", "Insulation Type", "Temperature", "Thickness (mm)", 
      "MOC", "Payment Milestone"
    ];

    const csvRows = rows.map((row) => [
      row.srNo, row.lineNo, row.pipeSize, row.isFactor, row.nps, row.length,
      row.area.toFixed(3), row.insulationType, row.temperature, row.thickness,
      row.moc, row.paymentMilestone
    ]);

    const csvContent = [
      headers.join(","),
      ...csvRows.map((r) => r.map((cell) => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `piping-insulation-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success(`Exported ${rows.length} rows`);
  };

  const totalArea = rows.reduce((sum, row) => sum + row.area, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button onClick={addRow} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Row
        </Button>
        <Button onClick={exportToCSV} variant="secondary" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12 text-center">Sr</TableHead>
              <TableHead className="min-w-[120px]">Line No</TableHead>
              <TableHead className="min-w-[100px]">Pipe Size</TableHead>
              <TableHead className="min-w-[80px]">IS Factor</TableHead>
              <TableHead className="min-w-[80px]">NPS</TableHead>
              <TableHead className="min-w-[100px]">Length (m)</TableHead>
              <TableHead className="min-w-[100px] bg-primary/10 text-primary font-semibold">Area (m²)</TableHead>
              <TableHead className="min-w-[120px]">Insulation Type</TableHead>
              <TableHead className="min-w-[100px]">Temperature</TableHead>
              <TableHead className="min-w-[80px]">Thickness</TableHead>
              <TableHead className="min-w-[100px]">MOC</TableHead>
              <TableHead className="min-w-[130px]">Milestone</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/30">
                <TableCell className="text-center font-medium text-muted-foreground">
                  {row.srNo}
                </TableCell>
                <TableCell>
                  <Input
                    value={row.lineNo}
                    onChange={(e) => updateRow(row.id, "lineNo", e.target.value)}
                    placeholder="Line No"
                    className="h-8 text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={row.pipeSize}
                    onValueChange={(value) => updateRow(row.id, "pipeSize", value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                      {PIPE_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    value={row.isFactor}
                    onChange={(e) => updateRow(row.id, "isFactor", e.target.value)}
                    placeholder="Factor"
                    className="h-8 text-sm bg-muted/50"
                    readOnly
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.nps}
                    onChange={(e) => updateRow(row.id, "nps", e.target.value)}
                    placeholder="NPS"
                    className="h-8 text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={row.length}
                    onChange={(e) => updateRow(row.id, "length", e.target.value)}
                    placeholder="0.000"
                    className="h-8 text-sm"
                    step="0.001"
                  />
                </TableCell>
                <TableCell className="bg-primary/5">
                  <div className="font-semibold text-primary">
                    {row.area.toFixed(3)}
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={row.insulationType}
                    onValueChange={(value) => updateRow(row.id, "insulationType", value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INSULATION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    value={row.temperature}
                    onChange={(e) => updateRow(row.id, "temperature", e.target.value)}
                    placeholder="°C"
                    className="h-8 text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.thickness}
                    onChange={(e) => updateRow(row.id, "thickness", e.target.value)}
                    placeholder="mm"
                    className="h-8 text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={row.moc}
                    onValueChange={(value) => updateRow(row.id, "moc", value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MOC_OPTIONS.map((moc) => (
                        <SelectItem key={moc} value={moc}>
                          {moc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={row.paymentMilestone}
                    onValueChange={(value) => updateRow(row.id, "paymentMilestone", value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_MILESTONES.map((milestone) => (
                        <SelectItem key={milestone} value={milestone}>
                          {milestone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => deleteRow(row.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Formula:</span> Area = IS Factor × Length
        </div>
        <div className="text-lg font-bold text-primary">
          Total Area: {totalArea.toFixed(3)} m²
        </div>
      </div>
    </div>
  );
};
