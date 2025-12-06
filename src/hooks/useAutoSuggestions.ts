import { useMemo } from "react";
import { EquipmentRow } from "@/types/equipment";

export const useAutoSuggestions = (rows: EquipmentRow[]) => {
  return useMemo(() => {
    const equipmentNos = [...new Set(rows.map((r) => r.equipmentNo).filter(Boolean))];
    const equipmentNames = [...new Set(rows.map((r) => r.equipmentName).filter(Boolean))];
    const temperatures = [...new Set(rows.map((r) => r.temperature).filter(Boolean))];
    const thicknesses = [...new Set(rows.map((r) => r.thickness).filter(Boolean))];

    return {
      equipmentNo: equipmentNos,
      equipmentName: equipmentNames,
      temperature: temperatures,
      thickness: thicknesses,
    };
  }, [rows]);
};
