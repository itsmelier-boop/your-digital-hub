export interface InsulationRow {
  id: string;
  srNo: number;
  lineNo: string;
  pipeSize: string;
  isFactor: string;
  nps: string;
  length: string;
  area: number;
  insulationType: string;
  temperature: string;
  thickness: string;
  moc: string;
  paymentMilestone: string;
}

export const PIPE_SIZES = [
  "1/2\"", "3/4\"", "1\"", "1-1/4\"", "1-1/2\"", "2\"", "2-1/2\"", "3\"", 
  "4\"", "5\"", "6\"", "8\"", "10\"", "12\"", "14\"", "16\"", "18\"", 
  "20\"", "24\"", "30\"", "36\"", "42\"", "48\""
];

export const IS_FACTORS: Record<string, string> = {
  "1/2\"": "0.0482",
  "3/4\"": "0.0584",
  "1\"": "0.0735",
  "1-1/4\"": "0.0889",
  "1-1/2\"": "0.0991",
  "2\"": "0.1194",
  "2-1/2\"": "0.1397",
  "3\"": "0.1600",
  "4\"": "0.1954",
  "5\"": "0.2362",
  "6\"": "0.2667",
  "8\"": "0.3327",
  "10\"": "0.4039",
  "12\"": "0.4699",
  "14\"": "0.5080",
  "16\"": "0.5740",
  "18\"": "0.6401",
  "20\"": "0.7010",
  "24\"": "0.8331",
  "30\"": "1.0262",
  "36\"": "1.2192",
  "42\"": "1.4122",
  "48\"": "1.6052"
};

export const INSULATION_TYPES = ["Hot", "Cold", "Acoustic", "Personal Protection"];
export const MOC_OPTIONS = ["Aluminium", "GI", "SS304", "SS316"];
export const PAYMENT_MILESTONES = ["Not Started", "Insulation Done", "Cladding Done", "Completed"];
