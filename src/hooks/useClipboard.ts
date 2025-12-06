import { useCallback } from "react";
import { EquipmentRow } from "@/types/equipment";
import { toast } from "sonner";

interface UseClipboardProps {
  rows: EquipmentRow[];
  onUpdateRow: (id: string, field: keyof EquipmentRow, value: any) => void;
  addRows: (count: number) => string[];
}

export const FIELD_ORDER: (keyof EquipmentRow)[] = [
  "equipmentNo",
  "equipmentName",
  "portion",
  "position",
  "temperature",
  "moc",
  "insulationType",
  "thickness",
  "insulatedDiameter",
  "heightLength",
  "dishFactor",
  "dishEndNos",
  "otherArea",
  "paymentMilestone",
];

export const useClipboard = ({ rows, onUpdateRow, addRows }: UseClipboardProps) => {
  const handlePaste = useCallback(
    (e: ClipboardEvent, startRowIndex: number, startFieldIndex: number) => {
      const clipboardData = e.clipboardData?.getData("text");
      if (!clipboardData) return;

      e.preventDefault();

      const pastedRows = clipboardData.split("\n").filter((row) => row.trim());
      const pastedData = pastedRows.map((row) => row.split("\t"));

      const rowsNeeded = startRowIndex + pastedData.length - rows.length;
      let newRowIds: string[] = [];
      if (rowsNeeded > 0) {
        newRowIds = addRows(rowsNeeded);
      }

      const allRows = [...rows];
      newRowIds.forEach((id, index) => {
        allRows.push({
          id,
          srNo: rows.length + index + 1,
        } as EquipmentRow);
      });

      pastedData.forEach((rowData, rowOffset) => {
        const targetRowIndex = startRowIndex + rowOffset;
        const targetRow = allRows[targetRowIndex];
        if (!targetRow) return;

        rowData.forEach((value, colOffset) => {
          const fieldIndex = startFieldIndex + colOffset;
          if (fieldIndex >= FIELD_ORDER.length) return;

          const field = FIELD_ORDER[fieldIndex];
          onUpdateRow(targetRow.id, field, value.trim());
        });
      });

      toast.success(`Pasted ${pastedData.length} rows`);
    },
    [rows, onUpdateRow, addRows]
  );

  return { handlePaste, FIELD_ORDER };
};
