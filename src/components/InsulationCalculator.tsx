import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export interface PipeEntry {
  id: string;
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
}

const IS_FACTORS: Record<string, number> = {
  elbow90: 1.5,
  elbow45: 0.75,
  tee: 2.0,
  reducer: 1.0,
  endCap: 1.0,
  flangeRem: 0.5,
  valveRem: 2.5,
  flangeFix: 0.5,
  valveFix: 2.5,
  weldValveFix: 2.0,
};

const createEmptyEntry = (): PipeEntry => ({
  id: crypto.randomUUID(),
  location: "",
  drawingNo: "",
  sheetNo: "",
  moc: "CS",
  lineSize: "50",
  pipeOD: 60.3,
  insulationThickness: 50,
  insulationType: "Nitrile",
  operatingTemp: 20,
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
});

export const InsulationCalculator = () => {
  const [entries, setEntries] = useState<PipeEntry[]>([createEmptyEntry()]);

  const calculateResults = (entry: PipeEntry) => {
    const totalFittingsLength =
      entry.qtyElbow90 * IS_FACTORS.elbow90 +
      entry.qtyElbow45 * IS_FACTORS.elbow45 +
      entry.qtyTee * IS_FACTORS.tee +
      entry.qtyReducer * IS_FACTORS.reducer +
      entry.qtyEndCap * IS_FACTORS.endCap +
      entry.qtyFlangeRem * IS_FACTORS.flangeRem +
      entry.qtyValveRem * IS_FACTORS.valveRem +
      entry.qtyFlangeFix * IS_FACTORS.flangeFix +
      entry.qtyValveFix * IS_FACTORS.valveFix +
      entry.qtyWeldValveFix * IS_FACTORS.weldValveFix;

    const rmt = entry.pipeLength + totalFittingsLength;
    const odInsulated = (entry.pipeOD + 2 * entry.insulationThickness) / 1000;
    const area = Math.PI * odInsulated * rmt;

    return {
      totalFittingsLength: totalFittingsLength.toFixed(2),
      rmt: rmt.toFixed(2),
      area: area.toFixed(3),
    };
  };

  const updateEntry = (id: string, field: keyof PipeEntry, value: any) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const addEntry = () => {
    setEntries([...entries, createEmptyEntry()]);
    toast.success("New entry added");
  };

  const removeEntry = (id: string) => {
    if (entries.length === 1) {
      toast.error("At least one entry is required");
      return;
    }
    setEntries(entries.filter(entry => entry.id !== id));
    toast.success("Entry removed");
  };

  const getTotalSummary = () => {
    const totals = entries.reduce((acc, entry) => {
      const results = calculateResults(entry);
      return {
        totalRMT: acc.totalRMT + parseFloat(results.rmt),
        totalArea: acc.totalArea + parseFloat(results.area),
      };
    }, { totalRMT: 0, totalArea: 0 });

    return totals;
  };

  const exportToExcel = () => {
    const exportData = entries.map((entry, index) => {
      const results = calculateResults(entry);
      return {
        "Sr. No.": index + 1,
        "Location": entry.location,
        "Drawing No.": entry.drawingNo,
        "Sheet No.": entry.sheetNo,
        "MOC": entry.moc,
        "Line Size": entry.lineSize,
        "Pipe OD (mm)": entry.pipeOD,
        "Insulation Thickness (mm)": entry.insulationThickness,
        "Insulation Type": entry.insulationType,
        "Operating Temp (°C)": entry.operatingTemp,
        "Pipe Length (m)": entry.pipeLength,
        "90° Elbow": entry.qtyElbow90,
        "45° Elbow": entry.qtyElbow45,
        "Tee": entry.qtyTee,
        "Reducer": entry.qtyReducer,
        "End Cap": entry.qtyEndCap,
        "Flange Rem": entry.qtyFlangeRem,
        "Valve Rem": entry.qtyValveRem,
        "Flange Fix": entry.qtyFlangeFix,
        "Valve Fix": entry.qtyValveFix,
        "Weld Valve Fix": entry.qtyWeldValveFix,
        "Fittings Length (m)": results.totalFittingsLength,
        "RMT (m)": results.rmt,
        "Area (sqm)": results.area,
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Insulation Data");
    XLSX.writeFile(wb, `Insulation_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Exported successfully");
  };

  const summary = getTotalSummary();

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6 bg-gradient-hero text-primary-foreground shadow-elevated">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold">Project Summary</h3>
          <Button onClick={exportToExcel} variant="secondary" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export Excel
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm opacity-90">Total Entries</div>
            <div className="text-3xl font-bold">{entries.length}</div>
          </div>
          <div>
            <div className="text-sm opacity-90">Total RMT (m)</div>
            <div className="text-3xl font-bold">{summary.totalRMT.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm opacity-90">Total Area (sqm)</div>
            <div className="text-3xl font-bold">{summary.totalArea.toFixed(3)}</div>
          </div>
        </div>
      </Card>

      {/* Entries */}
      {entries.map((entry, index) => {
        const results = calculateResults(entry);
        
        return (
          <Card key={entry.id} className="p-6 shadow-card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-foreground">Entry #{index + 1}</h3>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeEntry(entry.id)}
                disabled={entries.length === 1}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <Label htmlFor={`location-${entry.id}`}>Location / Unit</Label>
                <Input
                  id={`location-${entry.id}`}
                  value={entry.location}
                  onChange={(e) => updateEntry(entry.id, 'location', e.target.value)}
                  placeholder="e.g., Unit-1"
                />
              </div>

              <div>
                <Label htmlFor={`drawing-${entry.id}`}>Drawing No.</Label>
                <Input
                  id={`drawing-${entry.id}`}
                  value={entry.drawingNo}
                  onChange={(e) => updateEntry(entry.id, 'drawingNo', e.target.value)}
                  placeholder="e.g., DWG-001"
                />
              </div>

              <div>
                <Label htmlFor={`sheet-${entry.id}`}>Sheet No.</Label>
                <Input
                  id={`sheet-${entry.id}`}
                  value={entry.sheetNo}
                  onChange={(e) => updateEntry(entry.id, 'sheetNo', e.target.value)}
                  placeholder="e.g., SH-01"
                />
              </div>

              <div>
                <Label htmlFor={`moc-${entry.id}`}>MOC</Label>
                <Select value={entry.moc} onValueChange={(value) => updateEntry(entry.id, 'moc', value)}>
                  <SelectTrigger id={`moc-${entry.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CS">CS (Carbon Steel)</SelectItem>
                    <SelectItem value="SS">SS (Stainless Steel)</SelectItem>
                    <SelectItem value="GI">GI (Galvanized Iron)</SelectItem>
                    <SelectItem value="CPVC">CPVC</SelectItem>
                    <SelectItem value="PVC">PVC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor={`linesize-${entry.id}`}>Line Size (inch)</Label>
                <Select value={entry.lineSize} onValueChange={(value) => updateEntry(entry.id, 'lineSize', value)}>
                  <SelectTrigger id={`linesize-${entry.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['15', '20', '25', '32', '40', '50', '65', '80', '100', '125', '150', '200', '250', '300'].map(size => (
                      <SelectItem key={size} value={size}>{size}"</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor={`od-${entry.id}`}>Pipe OD (mm)</Label>
                <Input
                  id={`od-${entry.id}`}
                  type="number"
                  value={entry.pipeOD}
                  onChange={(e) => updateEntry(entry.id, 'pipeOD', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor={`thickness-${entry.id}`}>Insulation Thickness (mm)</Label>
                <Input
                  id={`thickness-${entry.id}`}
                  type="number"
                  value={entry.insulationThickness}
                  onChange={(e) => updateEntry(entry.id, 'insulationThickness', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor={`type-${entry.id}`}>Insulation Type</Label>
                <Select value={entry.insulationType} onValueChange={(value) => updateEntry(entry.id, 'insulationType', value)}>
                  <SelectTrigger id={`type-${entry.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nitrile">Nitrile</SelectItem>
                    <SelectItem value="Rockwool">Rockwool</SelectItem>
                    <SelectItem value="PU">PU (Polyurethane)</SelectItem>
                    <SelectItem value="PUF">PUF (Polyurethane Foam)</SelectItem>
                    <SelectItem value="Glass Wool">Glass Wool</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor={`temp-${entry.id}`}>Operating Temp (°C)</Label>
                <Input
                  id={`temp-${entry.id}`}
                  type="number"
                  value={entry.operatingTemp}
                  onChange={(e) => updateEntry(entry.id, 'operatingTemp', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor={`length-${entry.id}`}>Pipe Length (m)</Label>
                <Input
                  id={`length-${entry.id}`}
                  type="number"
                  step="0.01"
                  value={entry.pipeLength}
                  onChange={(e) => updateEntry(entry.id, 'pipeLength', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Fittings Section */}
            <div className="border-t border-border pt-6 mb-6">
              <h4 className="font-semibold text-foreground mb-4">Fittings Quantities</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor={`elbow90-${entry.id}`}>90° Elbow</Label>
                  <Input
                    id={`elbow90-${entry.id}`}
                    type="number"
                    value={entry.qtyElbow90}
                    onChange={(e) => updateEntry(entry.id, 'qtyElbow90', parseInt(e.target.value) || 0)}
                    className="text-center"
                  />
                  <div className="text-xs text-muted-foreground text-center mt-1">ISF: {IS_FACTORS.elbow90}</div>
                </div>

                <div>
                  <Label htmlFor={`elbow45-${entry.id}`}>45° Elbow</Label>
                  <Input
                    id={`elbow45-${entry.id}`}
                    type="number"
                    value={entry.qtyElbow45}
                    onChange={(e) => updateEntry(entry.id, 'qtyElbow45', parseInt(e.target.value) || 0)}
                    className="text-center"
                  />
                  <div className="text-xs text-muted-foreground text-center mt-1">ISF: {IS_FACTORS.elbow45}</div>
                </div>

                <div>
                  <Label htmlFor={`tee-${entry.id}`}>Tee / Branch</Label>
                  <Input
                    id={`tee-${entry.id}`}
                    type="number"
                    value={entry.qtyTee}
                    onChange={(e) => updateEntry(entry.id, 'qtyTee', parseInt(e.target.value) || 0)}
                    className="text-center"
                  />
                  <div className="text-xs text-muted-foreground text-center mt-1">ISF: {IS_FACTORS.tee}</div>
                </div>

                <div>
                  <Label htmlFor={`reducer-${entry.id}`}>Reducer</Label>
                  <Input
                    id={`reducer-${entry.id}`}
                    type="number"
                    value={entry.qtyReducer}
                    onChange={(e) => updateEntry(entry.id, 'qtyReducer', parseInt(e.target.value) || 0)}
                    className="text-center"
                  />
                  <div className="text-xs text-muted-foreground text-center mt-1">ISF: {IS_FACTORS.reducer}</div>
                </div>

                <div>
                  <Label htmlFor={`endcap-${entry.id}`}>End Cap</Label>
                  <Input
                    id={`endcap-${entry.id}`}
                    type="number"
                    value={entry.qtyEndCap}
                    onChange={(e) => updateEntry(entry.id, 'qtyEndCap', parseInt(e.target.value) || 0)}
                    className="text-center"
                  />
                  <div className="text-xs text-muted-foreground text-center mt-1">ISF: {IS_FACTORS.endCap}</div>
                </div>

                <div>
                  <Label htmlFor={`flangerem-${entry.id}`}>Flange (Rem. Box)</Label>
                  <Input
                    id={`flangerem-${entry.id}`}
                    type="number"
                    value={entry.qtyFlangeRem}
                    onChange={(e) => updateEntry(entry.id, 'qtyFlangeRem', parseInt(e.target.value) || 0)}
                    className="text-center"
                  />
                  <div className="text-xs text-muted-foreground text-center mt-1">ISF: {IS_FACTORS.flangeRem}</div>
                </div>

                <div>
                  <Label htmlFor={`valverem-${entry.id}`}>Valve (Rem. Box)</Label>
                  <Input
                    id={`valverem-${entry.id}`}
                    type="number"
                    value={entry.qtyValveRem}
                    onChange={(e) => updateEntry(entry.id, 'qtyValveRem', parseInt(e.target.value) || 0)}
                    className="text-center"
                  />
                  <div className="text-xs text-muted-foreground text-center mt-1">ISF: {IS_FACTORS.valveRem}</div>
                </div>

                <div>
                  <Label htmlFor={`flangefix-${entry.id}`}>Flange (Fix Box)</Label>
                  <Input
                    id={`flangefix-${entry.id}`}
                    type="number"
                    value={entry.qtyFlangeFix}
                    onChange={(e) => updateEntry(entry.id, 'qtyFlangeFix', parseInt(e.target.value) || 0)}
                    className="text-center"
                  />
                  <div className="text-xs text-muted-foreground text-center mt-1">ISF: {IS_FACTORS.flangeFix}</div>
                </div>

                <div>
                  <Label htmlFor={`valvefix-${entry.id}`}>Valve (Fix Box)</Label>
                  <Input
                    id={`valvefix-${entry.id}`}
                    type="number"
                    value={entry.qtyValveFix}
                    onChange={(e) => updateEntry(entry.id, 'qtyValveFix', parseInt(e.target.value) || 0)}
                    className="text-center"
                  />
                  <div className="text-xs text-muted-foreground text-center mt-1">ISF: {IS_FACTORS.valveFix}</div>
                </div>

                <div>
                  <Label htmlFor={`weldvalvefix-${entry.id}`}>Weld Valve (Fix)</Label>
                  <Input
                    id={`weldvalvefix-${entry.id}`}
                    type="number"
                    value={entry.qtyWeldValveFix}
                    onChange={(e) => updateEntry(entry.id, 'qtyWeldValveFix', parseInt(e.target.value) || 0)}
                    className="text-center"
                  />
                  <div className="text-xs text-muted-foreground text-center mt-1">ISF: {IS_FACTORS.weldValveFix}</div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/30">
              <h4 className="font-semibold text-accent mb-3">Calculated Results</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Fittings Equiv. Length</div>
                  <div className="text-2xl font-bold text-accent">{results.totalFittingsLength} m</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">RMT (Effective Running Meter)</div>
                  <div className="text-2xl font-bold text-accent">{results.rmt} m</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Insulation Area</div>
                  <div className="text-2xl font-bold text-accent">{results.area} sqm</div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}

      {/* Add Entry Button */}
      <div className="flex justify-center">
        <Button onClick={addEntry} size="lg" className="shadow-elevated">
          <Plus className="w-5 h-5 mr-2" />
          Add New Entry
        </Button>
      </div>
    </div>
  );
};
