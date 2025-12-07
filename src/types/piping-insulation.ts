export interface PipeEntry {
  id: string;
  srNo: number;
  location: string;
  drawingNo: string;
  sheetNo: string;
  moc: string;
  lineSize: string;
  pipeOD: number;
  insulationThickness: number;
  insulationType: string;
  operatingTemp: number;
  pipeLength: number;
  qtyElbow90: number;
  qtyElbow45: number;
  qtyTee: number;
  qtyReducer: number;
  qtyEndCap: number;
  qtyFlangeRem: number;
  qtyValveRem: number;
  qtyFlangeFix: number;
  qtyValveFix: number;
  qtyWeldValveFix: number;
  totalFittingsLength: number;
  rmt: number;
  area: number;
}

// IS Factor lookup table based on line size ranges
export const IS_FACTOR_TABLE: Record<string, {
  elbow90: number;
  elbow45: number;
  tee: number;
  reducer: number;
  endCap: number;
  flangeRem: number;
  valveRem: number;
  flangeFix: number;
  valveFix: number;
  weldValveFix: number;
}> = {
  '15': { elbow90: 0.5, elbow45: 0.35, tee: 0.7, reducer: 0.2, endCap: 0.2, flangeRem: 1.8, valveRem: 2.5, flangeFix: 1.08, valveFix: 1.5, weldValveFix: 0.2 },
  '20': { elbow90: 0.5, elbow45: 0.35, tee: 0.7, reducer: 0.2, endCap: 0.2, flangeRem: 1.8, valveRem: 2.5, flangeFix: 1.08, valveFix: 1.5, weldValveFix: 0.2 },
  '25': { elbow90: 0.5, elbow45: 0.35, tee: 0.7, reducer: 0.2, endCap: 0.2, flangeRem: 1.8, valveRem: 2.5, flangeFix: 1.08, valveFix: 1.5, weldValveFix: 0.2 },
  '32': { elbow90: 0.5, elbow45: 0.35, tee: 0.7, reducer: 0.2, endCap: 0.2, flangeRem: 1.8, valveRem: 2.5, flangeFix: 1.08, valveFix: 1.5, weldValveFix: 0.2 },
  '40': { elbow90: 0.5, elbow45: 0.35, tee: 0.7, reducer: 0.2, endCap: 0.2, flangeRem: 1.8, valveRem: 2.5, flangeFix: 1.08, valveFix: 1.5, weldValveFix: 0.2 },
  '50': { elbow90: 0.6, elbow45: 0.4, tee: 0.7, reducer: 0.2, endCap: 0.2, flangeRem: 1.9, valveRem: 3, flangeFix: 1.14, valveFix: 1.8, weldValveFix: 0.6 },
  '65': { elbow90: 0.6, elbow45: 0.4, tee: 0.7, reducer: 0.2, endCap: 0.2, flangeRem: 1.9, valveRem: 3, flangeFix: 1.14, valveFix: 1.8, weldValveFix: 0.6 },
  '80': { elbow90: 0.6, elbow45: 0.4, tee: 0.7, reducer: 0.2, endCap: 0.2, flangeRem: 1.9, valveRem: 3, flangeFix: 1.14, valveFix: 1.8, weldValveFix: 0.6 },
  '100': { elbow90: 1, elbow45: 0.65, tee: 0.7, reducer: 0.2, endCap: 0.2, flangeRem: 2, valveRem: 3.5, flangeFix: 1.32, valveFix: 2.1, weldValveFix: 0.6 },
  '125': { elbow90: 1, elbow45: 0.65, tee: 0.7, reducer: 0.2, endCap: 0.2, flangeRem: 2, valveRem: 3.5, flangeFix: 1.32, valveFix: 2.1, weldValveFix: 0.6 },
  '150': { elbow90: 1, elbow45: 0.65, tee: 0.7, reducer: 0.2, endCap: 0.2, flangeRem: 2, valveRem: 3.5, flangeFix: 1.32, valveFix: 2.1, weldValveFix: 0.6 },
  '200': { elbow90: 1.4, elbow45: 0.85, tee: 0.75, reducer: 0.2, endCap: 0.2, flangeRem: 2.5, valveRem: 4, flangeFix: 1.5, valveFix: 2.4, weldValveFix: 0.6 },
  '250': { elbow90: 1.4, elbow45: 0.85, tee: 0.75, reducer: 0.2, endCap: 0.2, flangeRem: 2.5, valveRem: 4, flangeFix: 1.5, valveFix: 2.4, weldValveFix: 0.6 },
  '300': { elbow90: 1.4, elbow45: 0.85, tee: 0.75, reducer: 0.2, endCap: 0.2, flangeRem: 2.5, valveRem: 4, flangeFix: 1.5, valveFix: 2.4, weldValveFix: 0.6 },
  '350': { elbow90: 1.4, elbow45: 0.85, tee: 0.75, reducer: 0.2, endCap: 0.2, flangeRem: 2.5, valveRem: 4, flangeFix: 1.5, valveFix: 2.4, weldValveFix: 0.6 },
  '400': { elbow90: 1.5, elbow45: 0.9, tee: 0.85, reducer: 0.3, endCap: 0.2, flangeRem: 2.7, valveRem: 4.5, flangeFix: 1.62, valveFix: 2.7, weldValveFix: 0.6 },
  '450': { elbow90: 1.5, elbow45: 0.9, tee: 0.85, reducer: 0.3, endCap: 0.2, flangeRem: 2.7, valveRem: 4.5, flangeFix: 1.62, valveFix: 2.7, weldValveFix: 0.6 },
  '500': { elbow90: 1.5, elbow45: 0.9, tee: 0.85, reducer: 0.3, endCap: 0.2, flangeRem: 2.7, valveRem: 4.5, flangeFix: 1.62, valveFix: 2.7, weldValveFix: 0.6 },
  '600': { elbow90: 1.7, elbow45: 1.05, tee: 1.1, reducer: 0.45, endCap: 0.2, flangeRem: 3, valveRem: 6, flangeFix: 1.8, valveFix: 3, weldValveFix: 0.6 },
};

export const getISFactors = (lineSize: string) => {
  return IS_FACTOR_TABLE[lineSize] || IS_FACTOR_TABLE['50'];
};

export const LINE_SIZES = ['15', '20', '25', '32', '40', '50', '65', '80', '100', '125', '150', '200', '250', '300', '350', '400', '450', '500', '600'];

export const MOC_OPTIONS = ['CS', 'SS', 'GI', 'CPVC', 'PVC'];

export const INSULATION_TYPES = ['Hot', 'Cold', 'Dual', 'PP', 'HT', 'Nitrile', 'Rockwool', 'PU', 'PUF', 'Glass Wool'];

export const EDITABLE_COLUMNS = [
  'location', 'drawingNo', 'sheetNo', 'moc', 'lineSize', 'pipeOD', 'insulationThickness',
  'insulationType', 'operatingTemp', 'pipeLength', 'qtyElbow90', 'qtyElbow45', 'qtyTee',
  'qtyReducer', 'qtyEndCap', 'qtyFlangeRem', 'qtyValveRem', 'qtyFlangeFix', 'qtyValveFix', 'qtyWeldValveFix'
];

export const NUMERIC_COLUMNS = [
  'pipeOD', 'insulationThickness', 'operatingTemp', 'pipeLength',
  'qtyElbow90', 'qtyElbow45', 'qtyTee', 'qtyReducer', 'qtyEndCap',
  'qtyFlangeRem', 'qtyValveRem', 'qtyFlangeFix', 'qtyValveFix', 'qtyWeldValveFix'
];

export const createEmptyEntry = (srNo: number): PipeEntry => {
  const entry: PipeEntry = {
    id: crypto.randomUUID(),
    srNo,
    location: "",
    drawingNo: "",
    sheetNo: "",
    moc: "",
    lineSize: "",
    pipeOD: 0,
    insulationThickness: 0,
    insulationType: "",
    operatingTemp: 0,
    pipeLength: 0,
    qtyElbow90: 0,
    qtyElbow45: 0,
    qtyTee: 0,
    qtyReducer: 0,
    qtyEndCap: 0,
    qtyFlangeRem: 0,
    qtyValveRem: 0,
    qtyFlangeFix: 0,
    qtyValveFix: 0,
    qtyWeldValveFix: 0,
    totalFittingsLength: 0,
    rmt: 0,
    area: 0,
  };
  return calculateResults(entry);
};

export const calculateResults = (entry: PipeEntry): PipeEntry => {
  const factors = getISFactors(entry.lineSize);
  
  const totalFittingsLength =
    entry.qtyElbow90 * factors.elbow90 +
    entry.qtyElbow45 * factors.elbow45 +
    entry.qtyTee * factors.tee +
    entry.qtyReducer * factors.reducer +
    entry.qtyEndCap * factors.endCap +
    entry.qtyFlangeRem * factors.flangeRem +
    entry.qtyValveRem * factors.valveRem +
    entry.qtyFlangeFix * factors.flangeFix +
    entry.qtyValveFix * factors.valveFix +
    entry.qtyWeldValveFix * factors.weldValveFix;

  const rmt = entry.pipeLength + totalFittingsLength;
  const odInsulated = (entry.pipeOD + 2 * entry.insulationThickness) / 1000;
  const area = Math.PI * odInsulated * rmt;

  return {
    ...entry,
    totalFittingsLength: parseFloat(totalFittingsLength.toFixed(2)),
    rmt: parseFloat(rmt.toFixed(2)),
    area: parseFloat(area.toFixed(3)),
  };
};
