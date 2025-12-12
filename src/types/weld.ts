export interface WeldJoint {
  id: string;
  slNo: number;
  jointNo: string;
  lineNo: string;
  size: number;
  schedule: string;
  material: string;
  weldType: string;
  welder: string;
  date: string;
  status: "pending" | "completed" | "rejected";
  remarks: string;
}

export type WeldCategory = "size" | "material" | "weldType" | "welder" | "status";
