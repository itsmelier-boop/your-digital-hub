import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  VisibilityState,
} from "@tanstack/react-table";
import { EquipmentRow } from "@/types/equipment";

interface UseEquipmentTableProps {
  rows: EquipmentRow[];
  onUpdateRow: (id: string, field: keyof EquipmentRow, value: any) => void;
  onDeleteRow: (id: string) => void;
  suggestions: {
    equipmentNo: string[];
    equipmentName: string[];
    temperature: string[];
    thickness: string[];
  };
}

export const useEquipmentTable = ({
  rows,
  onUpdateRow,
  onDeleteRow,
  suggestions,
}: UseEquipmentTableProps) => {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<EquipmentRow>[]>(
    () => [
      {
        accessorKey: "srNo",
        header: "Sr No",
        size: 60,
      },
      {
        accessorKey: "equipmentNo",
        header: "Equipment No",
        size: 120,
        meta: { editable: true, suggestions: suggestions.equipmentNo },
      },
      {
        accessorKey: "equipmentName",
        header: "Equipment Name",
        size: 150,
        meta: { editable: true, suggestions: suggestions.equipmentName },
      },
      {
        accessorKey: "portion",
        header: "Portion",
        size: 100,
        meta: { editable: true, type: "select", options: ["Shell", "Dish", "Nozzle", "Other"] },
      },
      {
        accessorKey: "position",
        header: "Position",
        size: 100,
        meta: { editable: true, type: "select", options: ["Vertical", "Horizontal"] },
      },
      {
        accessorKey: "temperature",
        header: "Temp (°C)",
        size: 90,
        meta: { editable: true, suggestions: suggestions.temperature },
      },
      {
        accessorKey: "moc",
        header: "MOC",
        size: 90,
        meta: { editable: true, type: "select", options: ["SS304", "SS316", "GI", "Aluminum"] },
      },
      {
        accessorKey: "insulationType",
        header: "Insulation Type",
        size: 110,
        meta: { editable: true, type: "select", options: ["Hot", "Cold", "Acoustic"] },
      },
      {
        accessorKey: "thickness",
        header: "Thickness (mm)",
        size: 100,
        meta: { editable: true, suggestions: suggestions.thickness },
      },
      {
        accessorKey: "insulatedDiameter",
        header: "Dia (m)",
        size: 90,
        meta: { editable: true },
      },
      {
        accessorKey: "heightLength",
        header: "Height/Length (m)",
        size: 110,
        meta: { editable: true },
      },
      {
        accessorKey: "shellArea",
        header: "Shell Area (m²)",
        size: 110,
        cell: ({ row }) => row.original.shellArea.toFixed(2),
        meta: { calculated: true },
      },
      {
        accessorKey: "dishFactor",
        header: "Dish Factor",
        size: 90,
        meta: { editable: true },
      },
      {
        accessorKey: "dishEndNos",
        header: "Dish End Nos",
        size: 90,
        meta: { editable: true },
      },
      {
        accessorKey: "dishArea",
        header: "Dish Area (m²)",
        size: 110,
        cell: ({ row }) => row.original.dishArea.toFixed(2),
        meta: { calculated: true },
      },
      {
        accessorKey: "otherArea",
        header: "Other Area (m²)",
        size: 100,
        meta: { editable: true },
      },
      {
        accessorKey: "totalArea",
        header: "Total Area (m²)",
        size: 110,
        cell: ({ row }) => row.original.totalArea.toFixed(2),
        meta: { calculated: true },
      },
      {
        accessorKey: "paymentMilestone",
        header: "Milestone",
        size: 100,
        meta: { editable: true, type: "select", options: ["Not Started", "25%", "50%", "75%", "100%"] },
      },
      {
        id: "actions",
        header: "",
        size: 50,
        cell: ({ row }) => ({
          onDelete: () => onDeleteRow(row.original.id),
        }),
        meta: { isAction: true },
      },
    ],
    [suggestions, onDeleteRow]
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    meta: { onUpdateRow },
  });

  return table;
};
