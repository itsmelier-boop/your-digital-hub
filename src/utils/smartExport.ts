import { EquipmentRow } from "@/types/equipment";

export const smartExportToCSV = (
  rows: EquipmentRow[],
  filename: string
): { success: boolean; message: string } => {
  if (rows.length === 0) {
    return { success: false, message: "No data to export" };
  }

  const headers = [
    "Sr No",
    "Equipment No",
    "Equipment Name",
    "Portion",
    "Position",
    "Temperature",
    "MOC",
    "Insulation Type",
    "Thickness (mm)",
    "Insulated Diameter (m)",
    "Height/Length (m)",
    "Shell Area (m²)",
    "Dish Factor",
    "Dish End Nos",
    "Dish Area (m²)",
    "Other Area (m²)",
    "Total Area (m²)",
    "Payment Milestone",
  ];

  const csvRows = rows.map((row) => [
    row.srNo,
    row.equipmentNo,
    row.equipmentName,
    row.portion,
    row.position,
    row.temperature,
    row.moc,
    row.insulationType,
    row.thickness,
    row.insulatedDiameter,
    row.heightLength,
    row.shellArea.toFixed(2),
    row.dishFactor,
    row.dishEndNos,
    row.dishArea.toFixed(2),
    row.otherArea,
    row.totalArea.toFixed(2),
    row.paymentMilestone,
  ]);

  const csvContent = [
    headers.join(","),
    ...csvRows.map((row) =>
      row.map((cell) => `"${cell}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);

  return { success: true, message: `Exported ${rows.length} rows to ${filename}` };
};
