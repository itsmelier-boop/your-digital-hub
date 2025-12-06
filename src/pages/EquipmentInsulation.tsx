import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EquipmentDataTable } from "@/components/EquipmentDataTable";
import { ColumnVisibilityToggle } from "@/components/ColumnVisibilityToggle";
import { useEquipmentTable } from "@/hooks/useEquipmentTable";
import { EquipmentRow } from "@/types/equipment";
import {
  calculateShellArea,
  calculateDishArea,
  calculateTotalArea,
} from "@/utils/calculations";
import { smartExportToCSV } from "@/utils/smartExport";
import { useClipboard, FIELD_ORDER } from "@/hooks/useClipboard";
import { useAutoSuggestions } from "@/hooks/useAutoSuggestions";
import { Plus, Download, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const EquipmentInsulation = () => {
  const { projectId, orderId, itemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const item = location.state?.item;

  const [rows, setRows] = useState<EquipmentRow[]>([
    {
      id: crypto.randomUUID(),
      srNo: 1,
      equipmentNo: "",
      equipmentName: "",
      portion: "Shell",
      position: "Vertical",
      temperature: "",
      moc: "SS304",
      insulationType: "Hot",
      thickness: "",
      insulatedDiameter: "",
      heightLength: "",
      shellArea: 0,
      dishFactor: "1.27",
      dishEndNos: "",
      dishArea: 0,
      otherArea: "",
      totalArea: 0,
      paymentMilestone: "Not Started",
    },
  ]);

  const updateRow = useCallback((id: string, field: keyof EquipmentRow, value: any) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id !== id) return row;

        const updatedRow = { ...row, [field]: value };

        updatedRow.shellArea = calculateShellArea(
          updatedRow.insulatedDiameter,
          updatedRow.heightLength,
          updatedRow.thickness
        );
        updatedRow.dishArea = calculateDishArea(
          updatedRow.insulatedDiameter,
          updatedRow.thickness,
          updatedRow.dishFactor,
          updatedRow.dishEndNos
        );
        updatedRow.totalArea = calculateTotalArea(
          updatedRow.shellArea,
          updatedRow.dishArea,
          updatedRow.otherArea
        );

        return updatedRow;
      })
    );
  }, []);

  const createNewRow = useCallback((srNo: number): EquipmentRow => ({
    id: crypto.randomUUID(),
    srNo,
    equipmentNo: "",
    equipmentName: "",
    portion: "Shell",
    position: "Vertical",
    temperature: "",
    moc: "SS304",
    insulationType: "Hot",
    thickness: "",
    insulatedDiameter: "",
    heightLength: "",
    shellArea: 0,
    dishFactor: "1.27",
    dishEndNos: "",
    dishArea: 0,
    otherArea: "",
    totalArea: 0,
    paymentMilestone: "Not Started",
  }), []);

  const addRow = () => {
    const newRow = createNewRow(rows.length + 1);
    setRows([...rows, newRow]);
    toast.success("New row added");
  };

  const addRows = useCallback((count: number): string[] => {
    const newRows: EquipmentRow[] = [];
    const newIds: string[] = [];
    for (let i = 0; i < count; i++) {
      const newRow = createNewRow(rows.length + i + 1);
      newRows.push(newRow);
      newIds.push(newRow.id);
    }
    setRows((prev) => [...prev, ...newRows]);
    return newIds;
  }, [rows.length, createNewRow]);

  const deleteRow = useCallback((id: string) => {
    setRows((prevRows) => {
      if (prevRows.length === 1) {
        toast.error("Cannot delete the last row");
        return prevRows;
      }
      const filtered = prevRows.filter((row) => row.id !== id);
      toast.success("Row deleted");
      return filtered.map((row, index) => ({ ...row, srNo: index + 1 }));
    });
  }, []);

  const suggestions = useAutoSuggestions(rows);

  const { handlePaste } = useClipboard({
    rows,
    onUpdateRow: updateRow,
    addRows,
  });

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const activeElement = document.activeElement as HTMLElement;
      const cellId = activeElement?.getAttribute("data-cell-id");
      
      if (cellId) {
        const [rowIndex, field] = cellId.split("-");
        const fieldIndex = FIELD_ORDER.indexOf(field as keyof EquipmentRow);
        if (fieldIndex >= 0) {
          handlePaste(e, parseInt(rowIndex), fieldIndex);
        }
      }
    };

    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [handlePaste]);

  const table = useEquipmentTable({
    rows,
    onUpdateRow: updateRow,
    onDeleteRow: deleteRow,
    suggestions,
  });

  const handleExportCSV = () => {
    const result = smartExportToCSV(
      rows,
      `equipment-insulation-${new Date().toISOString().split("T")[0]}.csv`
    );
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const totalArea = rows.reduce((sum, row) => sum + row.totalArea, 0);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {item && (
              <div className="bg-muted/50 p-4 rounded-lg mb-4">
                <h2 className="text-lg font-semibold">{item.description}</h2>
                <p className="text-sm text-muted-foreground">
                  Item Code: {item.itemCode} | Quantity: {item.quantity} {item.unit}
                </p>
              </div>
            )}
          </div>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-primary">
                Equipment Insulation Measurement
              </CardTitle>
              <p className="text-muted-foreground">
                Record and calculate insulation surface areas for equipment
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-3">
                  <Button onClick={addRow} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Row
                  </Button>
                  <Button
                    onClick={handleExportCSV}
                    variant="secondary"
                    className="gap-2"
                    disabled={rows.length === 0}
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                  <ColumnVisibilityToggle table={table} />
                </div>
                <div className="bg-primary/10 px-4 py-2 rounded-lg">
                  <span className="text-sm text-muted-foreground">Total Area: </span>
                  <span className="font-bold text-primary">{totalArea.toFixed(2)} m²</span>
                </div>
              </div>

              <EquipmentDataTable table={table} />

              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <h3 className="font-semibold text-foreground">Calculation Formulas:</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    <span className="font-medium text-primary">Shell Area</span>{" "}
                    = π × (Insulated Diameter + 2 × Thickness(mm) / 1000) × Height/Length
                  </li>
                  <li>
                    <span className="font-medium text-primary">Dish Area</span>{" "}
                    = π/4 × (Insulated Diameter + 2 × Thickness(mm) / 1000)² × Factor for Dish End × No. of Dish Ends
                  </li>
                  <li>
                    <span className="font-medium text-primary">Total Area</span>{" "}
                    = Shell Area + Dish Area + Other Area
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default EquipmentInsulation;
