export interface EquipmentRow {
  id: string;
  srNo: number;
  equipmentNo: string;
  equipmentName: string;
  portion: "Shell" | "Dish" | "Nozzle" | "Other";
  position: "Vertical" | "Horizontal";
  temperature: string;
  moc: "SS304" | "SS316" | "GI" | "Aluminum";
  insulationType: "Hot" | "Cold" | "Acoustic";
  thickness: string;
  insulatedDiameter: string;
  heightLength: string;
  shellArea: number;
  dishFactor: string;
  dishEndNos: string;
  dishArea: number;
  otherArea: string;
  totalArea: number;
  paymentMilestone: "Not Started" | "25%" | "50%" | "75%" | "100%";
}
