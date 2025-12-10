import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Plus, Trash2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  PipeEntry,
  getISFactors,
  LINE_SIZES,
  MOC_OPTIONS,
  INSULATION_TYPES,
  EDITABLE_COLUMNS,
  NUMERIC_COLUMNS,
  createEmptyEntry,
  calculateResults,
} from "@/types/piping-insulation";

// Input Cell Component with keyboard navigation
interface InputCellProps {
  value: any;
  rowId: string;
  rowIndex: number;
  columnId: string;
  isNumeric: boolean;
  onUpdate: (rowId: string, columnId: string, value: any) => void;
  onNavigate: (rowIndex: number, columnId: string, direction: 'up' | 'down' | 'left' | 'right') => void;
  onFocus: (rowIndex: number, columnId: string) => void;
}

const InputCell = React.memo(({ 
  value, 
  rowId, 
  rowIndex, 
  columnId, 
  isNumeric, 
  onUpdate, 
  onNavigate,
  onFocus 
}: InputCellProps) => {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const evaluateExpression = (expr: string): number | string => {
    if (typeof expr !== 'string') return expr;
    const trimmed = expr.trim();
    if (/^[0-9+\-*/(). ]+$/.test(trimmed)) {
      try {
        const result = Function('"use strict"; return (' + trimmed + ')')();
        return typeof result === 'number' && !isNaN(result) ? result : expr;
      } catch {
        return expr;
      }
    }
    return expr;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    if (isNumeric) {
      const strValue = String(localValue);
      const evaluated = evaluateExpression(strValue);
      const finalValue = typeof evaluated === 'number' ? evaluated : parseFloat(strValue) || 0;
      onUpdate(rowId, columnId, finalValue);
    } else {
      onUpdate(rowId, columnId, localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        handleBlur();
        onNavigate(rowIndex, columnId, 'down');
        break;
      case 'Tab':
        e.preventDefault();
        handleBlur();
        onNavigate(rowIndex, columnId, e.shiftKey ? 'left' : 'right');
        break;
      case 'ArrowUp':
        e.preventDefault();
        handleBlur();
        onNavigate(rowIndex, columnId, 'up');
        break;
      case 'ArrowDown':
        e.preventDefault();
        handleBlur();
        onNavigate(rowIndex, columnId, 'down');
        break;
    }
  };

  const handleFocus = () => {
    onFocus(rowIndex, columnId);
  };

  return (
    <div data-row={rowIndex} data-col={columnId}>
      <Input
        ref={inputRef}
        value={localValue ?? ''}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        type="text"
        inputMode={isNumeric ? "decimal" : "text"}
        className="h-8 text-sm border border-border rounded px-2 bg-background focus:border-primary focus:ring-1 focus:ring-primary/30"
      />
    </div>
  );
});

InputCell.displayName = 'InputCell';

// Select Cell Component with keyboard navigation
interface SelectCellProps {
  value: string;
  rowId: string;
  rowIndex: number;
  columnId: string;
  options: string[];
  formatOption?: (val: string) => string;
  onUpdate: (rowId: string, columnId: string, value: any) => void;
  onNavigate: (rowIndex: number, columnId: string, direction: 'up' | 'down' | 'left' | 'right') => void;
  onFocus: (rowIndex: number, columnId: string) => void;
}

const SelectCell = React.memo(({ 
  value, 
  rowId, 
  rowIndex, 
  columnId, 
  options, 
  formatOption,
  onUpdate,
  onNavigate,
  onFocus
}: SelectCellProps) => {
  const handleChange = (val: string) => {
    onUpdate(rowId, columnId, val);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      onNavigate(rowIndex, columnId, e.shiftKey ? 'left' : 'right');
    }
  };

  return (
    <div data-row={rowIndex} data-col={columnId} onKeyDown={handleKeyDown}>
      <Select value={value || ''} onValueChange={handleChange} onOpenChange={() => onFocus(rowIndex, columnId)}>
        <SelectTrigger className="h-8 text-sm border border-border rounded bg-background focus:border-primary">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent className="bg-popover z-50">
          {options.map(opt => (
            <SelectItem key={opt} value={opt}>
              {formatOption ? formatOption(opt) : opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

SelectCell.displayName = 'SelectCell';

export const InsulationDataTable = () => {
  const [data, setData] = useState<PipeEntry[]>([createEmptyEntry(1)]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnSizing, setColumnSizing] = useState({});
  const [focusedCell, setFocusedCell] = useState<{ rowIndex: number; columnId: string } | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const updateCell = useCallback((rowId: string, columnId: string, value: any) => {
    setData((old) =>
      old.map((row) => {
        if (row.id === rowId) {
          const updated = { ...row, [columnId]: value };
          return calculateResults(updated);
        }
        return row;
      })
    );
  }, []);

  const addRow = useCallback(() => {
    setData((old) => [...old, createEmptyEntry(old.length + 1)]);
    toast.success("New row added");
  }, []);

  const addRows = useCallback((count: number) => {
    setData((old) => {
      const newRows = Array.from({ length: count }, (_, i) => createEmptyEntry(old.length + i + 1));
      return [...old, ...newRows];
    });
  }, []);

  const deleteRow = useCallback((rowId: string) => {
    if (data.length === 1) {
      toast.error("At least one row is required");
      return;
    }
    setData((old) => old.filter((row) => row.id !== rowId).map((row, idx) => ({ ...row, srNo: idx + 1 })));
    toast.success("Row deleted");
  }, [data.length]);

  const handleCellFocus = useCallback((rowIndex: number, columnId: string) => {
    setFocusedCell({ rowIndex, columnId });
  }, []);

  const navigateToCell = useCallback((rowIndex: number, columnId: string, direction: 'up' | 'down' | 'left' | 'right') => {
    const colIndex = EDITABLE_COLUMNS.indexOf(columnId);
    let newRowIndex = rowIndex;
    let newColIndex = colIndex;

    switch (direction) {
      case 'up':
        newRowIndex = Math.max(0, rowIndex - 1);
        break;
      case 'down':
        if (rowIndex >= data.length - 1) {
          addRow();
          newRowIndex = data.length;
        } else {
          newRowIndex = rowIndex + 1;
        }
        break;
      case 'left':
        if (colIndex > 0) {
          newColIndex = colIndex - 1;
        } else if (rowIndex > 0) {
          newRowIndex = rowIndex - 1;
          newColIndex = EDITABLE_COLUMNS.length - 1;
        }
        break;
      case 'right':
        if (colIndex < EDITABLE_COLUMNS.length - 1) {
          newColIndex = colIndex + 1;
        } else if (rowIndex < data.length - 1) {
          newRowIndex = rowIndex + 1;
          newColIndex = 0;
        } else {
          addRow();
          newRowIndex = data.length;
          newColIndex = 0;
        }
        break;
    }

    const newColumnId = EDITABLE_COLUMNS[newColIndex];
    setFocusedCell({ rowIndex: newRowIndex, columnId: newColumnId });

    setTimeout(() => {
      const input = tableRef.current?.querySelector(
        `[data-row="${newRowIndex}"][data-col="${newColumnId}"] input`
      ) as HTMLInputElement;
      input?.focus();
      input?.select();
    }, 50);
  }, [data.length, addRow]);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (!focusedCell) return;
    
    const clipboardData = e.clipboardData?.getData('text');
    if (!clipboardData) return;

    e.preventDefault();

    const rows = clipboardData.split(/\r?\n/).filter(row => row.trim() !== '');
    const pastedData = rows.map(row => row.split('\t'));

    if (pastedData.length === 0) return;

    const startRowIndex = focusedCell.rowIndex;
    const startColIndex = EDITABLE_COLUMNS.indexOf(focusedCell.columnId);
    
    if (startColIndex === -1) return;

    const requiredRows = startRowIndex + pastedData.length;
    const rowsToAdd = requiredRows - data.length;

    if (rowsToAdd > 0) {
      addRows(rowsToAdd);
    }

    setTimeout(() => {
      setData(currentData => {
        const newData = [...currentData];
        let invalidCells = 0;

        pastedData.forEach((rowValues, rowOffset) => {
          const targetRowIndex = startRowIndex + rowOffset;
          if (targetRowIndex >= newData.length) return;

          rowValues.forEach((cellValue, colOffset) => {
            const targetColIndex = startColIndex + colOffset;
            if (targetColIndex >= EDITABLE_COLUMNS.length) return;

            const columnId = EDITABLE_COLUMNS[targetColIndex];
            const isNumeric = NUMERIC_COLUMNS.includes(columnId);
            
            let finalValue: string | number = cellValue.trim();

            if (isNumeric) {
              const parsed = parseFloat(finalValue);
              if (isNaN(parsed) && finalValue !== '') {
                invalidCells++;
                return;
              }
              finalValue = isNaN(parsed) ? 0 : parsed;
            }

            newData[targetRowIndex] = {
              ...newData[targetRowIndex],
              [columnId]: finalValue
            };
            newData[targetRowIndex] = calculateResults(newData[targetRowIndex]);
          });
        });

        if (invalidCells > 0) {
          toast.error(`${invalidCells} cell(s) had invalid data and were skipped`);
        } else {
          toast.success(`Pasted ${pastedData.length} row(s)`);
        }

        return newData;
      });
    }, 0);
  }, [focusedCell, data.length, addRows]);

  const handleCopy = useCallback((e: ClipboardEvent) => {
    if (!focusedCell) return;
    
    const row = data[focusedCell.rowIndex];
    if (!row) return;

    const value = row[focusedCell.columnId as keyof PipeEntry];
    e.clipboardData?.setData('text/plain', String(value));
    e.preventDefault();
  }, [focusedCell, data]);

  useEffect(() => {
    const handlePasteEvent = (e: ClipboardEvent) => handlePaste(e);
    const handleCopyEvent = (e: ClipboardEvent) => handleCopy(e);
    
    document.addEventListener('paste', handlePasteEvent);
    document.addEventListener('copy', handleCopyEvent);
    
    return () => {
      document.removeEventListener('paste', handlePasteEvent);
      document.removeEventListener('copy', handleCopyEvent);
    };
  }, [handlePaste, handleCopy]);

  const exportToExcel = () => {
    const nonBlankRows = data.filter(row => {
      return row.location.trim() !== '' ||
        row.drawingNo.trim() !== '' ||
        row.sheetNo.trim() !== '' ||
        row.moc !== '' ||
        row.lineSize !== '' ||
        row.pipeOD !== 0 ||
        row.insulationThickness !== 0 ||
        row.insulationType !== '' ||
        row.operatingTemp !== 0 ||
        row.pipeLength !== 0 ||
        row.qtyElbow90 !== 0 ||
        row.qtyElbow45 !== 0 ||
        row.qtyTee !== 0 ||
        row.qtyReducer !== 0 ||
        row.qtyEndCap !== 0 ||
        row.qtyFlangeRem !== 0 ||
        row.qtyValveRem !== 0 ||
        row.qtyFlangeFix !== 0 ||
        row.qtyValveFix !== 0 ||
        row.qtyWeldValveFix !== 0;
    });

    if (nonBlankRows.length === 0) {
      toast.error("No data to export");
      return;
    }

    const hasElbow90 = nonBlankRows.some(row => row.qtyElbow90 !== 0);
    const hasElbow45 = nonBlankRows.some(row => row.qtyElbow45 !== 0);
    const hasTee = nonBlankRows.some(row => row.qtyTee !== 0);
    const hasReducer = nonBlankRows.some(row => row.qtyReducer !== 0);
    const hasEndCap = nonBlankRows.some(row => row.qtyEndCap !== 0);
    const hasFlangeRem = nonBlankRows.some(row => row.qtyFlangeRem !== 0);
    const hasValveRem = nonBlankRows.some(row => row.qtyValveRem !== 0);
    const hasFlangeFix = nonBlankRows.some(row => row.qtyFlangeFix !== 0);
    const hasValveFix = nonBlankRows.some(row => row.qtyValveFix !== 0);
    const hasWeldValveFix = nonBlankRows.some(row => row.qtyWeldValveFix !== 0);

    const fullExportData = nonBlankRows.map((row, index) => {
      const factors = getISFactors(row.lineSize);
      const exportRow: Record<string, any> = {
        "Sr. No.": index + 1,
        "Location": row.location,
        "Drawing No.": row.drawingNo,
        "Sheet No.": row.sheetNo,
        "MOC": row.moc,
        "Line Size (NB)": row.lineSize,
        "Pipe OD (mm)": row.pipeOD,
        "Insulation Thickness (mm)": row.insulationThickness,
        "Insulation Type": row.insulationType,
        "Operating Temp (°C)": row.operatingTemp,
        "Pipe Length (m)": row.pipeLength,
      };

      if (hasElbow90) {
        exportRow["90° Elbow Qty"] = row.qtyElbow90;
        exportRow["90° Elbow IS Factor"] = factors.elbow90;
      }
      if (hasElbow45) {
        exportRow["45° Elbow Qty"] = row.qtyElbow45;
        exportRow["45° Elbow IS Factor"] = factors.elbow45;
      }
      if (hasTee) {
        exportRow["Tee Qty"] = row.qtyTee;
        exportRow["Tee IS Factor"] = factors.tee;
      }
      if (hasReducer) {
        exportRow["Reducer Qty"] = row.qtyReducer;
        exportRow["Reducer IS Factor"] = factors.reducer;
      }
      if (hasEndCap) {
        exportRow["End Cap Qty"] = row.qtyEndCap;
        exportRow["End Cap IS Factor"] = factors.endCap;
      }
      if (hasFlangeRem) {
        exportRow["Flange Rem Qty"] = row.qtyFlangeRem;
        exportRow["Flange Rem IS Factor"] = factors.flangeRem;
      }
      if (hasValveRem) {
        exportRow["Valve Rem Qty"] = row.qtyValveRem;
        exportRow["Valve Rem IS Factor"] = factors.valveRem;
      }
      if (hasFlangeFix) {
        exportRow["Flange Fix Qty"] = row.qtyFlangeFix;
        exportRow["Flange Fix IS Factor"] = factors.flangeFix;
      }
      if (hasValveFix) {
        exportRow["Valve Fix Qty"] = row.qtyValveFix;
        exportRow["Valve Fix IS Factor"] = factors.valveFix;
      }
      if (hasWeldValveFix) {
        exportRow["Weld Valve Fix Qty"] = row.qtyWeldValveFix;
        exportRow["Weld Valve IS Factor"] = factors.weldValveFix;
      }

      exportRow["Total Fittings Length (m)"] = row.totalFittingsLength;
      exportRow["RMT (m)"] = row.rmt;
      exportRow["Area (sqm)"] = row.area;

      return exportRow;
    });

    const ws = XLSX.utils.json_to_sheet(fullExportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Insulation Data");
    XLSX.writeFile(wb, `Insulation_Measurement_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Data exported successfully");
  };

  const columns = useMemo<ColumnDef<PipeEntry>[]>(
    () => [
      {
        accessorKey: "srNo",
        header: "Sr.",
        size: 60,
        cell: ({ getValue }) => <div className="text-center text-sm font-medium py-1">{getValue() as number}</div>,
      },
      { 
        accessorKey: "location", 
        header: "Location", 
        size: 140, 
        cell: ({ getValue, row }) => (
          <InputCell
            value={getValue()}
            rowId={row.original.id}
            rowIndex={row.index}
            columnId="location"
            isNumeric={false}
            onUpdate={updateCell}
            onNavigate={navigateToCell}
            onFocus={handleCellFocus}
          />
        )
      },
      { 
        accessorKey: "drawingNo", 
        header: "Drawing", 
        size: 120, 
        cell: ({ getValue, row }) => (
          <InputCell
            value={getValue()}
            rowId={row.original.id}
            rowIndex={row.index}
            columnId="drawingNo"
            isNumeric={false}
            onUpdate={updateCell}
            onNavigate={navigateToCell}
            onFocus={handleCellFocus}
          />
        )
      },
      { 
        accessorKey: "sheetNo", 
        header: "Sheet", 
        size: 100, 
        cell: ({ getValue, row }) => (
          <InputCell
            value={getValue()}
            rowId={row.original.id}
            rowIndex={row.index}
            columnId="sheetNo"
            isNumeric={false}
            onUpdate={updateCell}
            onNavigate={navigateToCell}
            onFocus={handleCellFocus}
          />
        )
      },
      { 
        accessorKey: "moc", 
        header: "MOC", 
        size: 100, 
        cell: ({ getValue, row }) => (
          <SelectCell
            value={getValue() as string}
            rowId={row.original.id}
            rowIndex={row.index}
            columnId="moc"
            options={MOC_OPTIONS}
            onUpdate={updateCell}
            onNavigate={navigateToCell}
            onFocus={handleCellFocus}
          />
        )
      },
      { 
        accessorKey: "lineSize", 
        header: "Size (NB)", 
        size: 110, 
        cell: ({ getValue, row }) => (
          <SelectCell
            value={getValue() as string}
            rowId={row.original.id}
            rowIndex={row.index}
            columnId="lineSize"
            options={LINE_SIZES}
            formatOption={(val) => `NB${val}`}
            onUpdate={updateCell}
            onNavigate={navigateToCell}
            onFocus={handleCellFocus}
          />
        )
      },
      { 
        accessorKey: "pipeOD", 
        header: "OD (mm)", 
        size: 100, 
        cell: ({ getValue, row }) => (
          <InputCell
            value={getValue()}
            rowId={row.original.id}
            rowIndex={row.index}
            columnId="pipeOD"
            isNumeric={true}
            onUpdate={updateCell}
            onNavigate={navigateToCell}
            onFocus={handleCellFocus}
          />
        )
      },
      { 
        accessorKey: "insulationThickness", 
        header: "Thk (mm)", 
        size: 100, 
        cell: ({ getValue, row }) => (
          <InputCell
            value={getValue()}
            rowId={row.original.id}
            rowIndex={row.index}
            columnId="insulationThickness"
            isNumeric={true}
            onUpdate={updateCell}
            onNavigate={navigateToCell}
            onFocus={handleCellFocus}
          />
        )
      },
      { 
        accessorKey: "insulationType", 
        header: "Type", 
        size: 120, 
        cell: ({ getValue, row }) => (
          <SelectCell
            value={getValue() as string}
            rowId={row.original.id}
            rowIndex={row.index}
            columnId="insulationType"
            options={INSULATION_TYPES}
            onUpdate={updateCell}
            onNavigate={navigateToCell}
            onFocus={handleCellFocus}
          />
        )
      },
      { 
        accessorKey: "operatingTemp", 
        header: "Temp (°C)", 
        size: 100, 
        cell: ({ getValue, row }) => (
          <InputCell
            value={getValue()}
            rowId={row.original.id}
            rowIndex={row.index}
            columnId="operatingTemp"
            isNumeric={true}
            onUpdate={updateCell}
            onNavigate={navigateToCell}
            onFocus={handleCellFocus}
          />
        )
      },
      { 
        accessorKey: "pipeLength", 
        header: "Length (m)", 
        size: 110, 
        cell: ({ getValue, row }) => (
          <InputCell
            value={getValue()}
            rowId={row.original.id}
            rowIndex={row.index}
            columnId="pipeLength"
            isNumeric={true}
            onUpdate={updateCell}
            onNavigate={navigateToCell}
            onFocus={handleCellFocus}
          />
        )
      },
      { 
        accessorKey: "qtyElbow90", 
        header: "E90°", 
        size: 80, 
        cell: ({ getValue, row }) => (
          <InputCell
            value={getValue()}
            rowId={row.original.id}
            rowIndex={row.index}
            columnId="qtyElbow90"
            isNumeric={true}
            onUpdate={updateCell}
            onNavigate={navigateToCell}
            onFocus={handleCellFocus}
          />
        )
      },
      { 
        accessorKey: "qtyElbow45", 
        header: "E45°", 
        size: 80, 
        cell: ({ getValue, row }) => (
          <InputCell
            value={getValue()}
            rowId={row.original.id}
            rowIndex={row.index}
            columnId="qtyElbow45"
            isNumeric={true}
            onUpdate={updateCell}
            onNavigate={navigateToCell}
            onFocus={handleCellFocus}
          />
        )
      },
      { 
        accessorKey: "qtyTee", 
        header: "Tee", 
        size: 70, 
        cell: ({ getValue, row }) => (
          <InputCell
            value={getValue()}
            rowId={row.original.id}
            rowIndex={row.index}
            columnId="qtyTee"
            isNumeric={true}
            onUpdate={updateCell}
            onNavigate={navigateToCell}
            onFocus={handleCellFocus}
          />
        )
      },
      { 
        accessorKey: "qtyReducer", 
        header: "Red", 
        size: 70, 
        cell: ({ getValue, row }) => (
          <InputCell
            value={getValue()}
            rowId={row.original.id}
            rowIndex={row.index}
            columnId="qtyReducer"
            isNumeric={true}
            onUpdate={updateCell}
            onNavigate={navigateToCell}
            onFocus={handleCellFocus}
          />
        )
      },
      { 
        accessorKey: "qtyEndCap", 
        header: "Cap", 
        size: 70, 
        cell: ({ getValue, row }) => (
          <InputCell
            value={getValue()}
            rowId={row.original.id}
            rowIndex={row.index}
            columnId="qtyEndCap"
            isNumeric={true}
            onUpdate={updateCell}
            onNavigate={navigateToCell}
            onFocus={handleCellFocus}
          />
        )
      },
      { 
        accessorKey: "qtyFlangeRem", 
        header: "FlgR", 
        size: 75, 
        cell: ({ getValue, row }) => (
          <InputCell
            value={getValue()}
            rowId={row.original.id}
            rowIndex={row.index}
            columnId="qtyFlangeRem"
            isNumeric={true}
            onUpdate={updateCell}
            onNavigate={navigateToCell}
            onFocus={handleCellFocus}
          />
        )
      },
      { 
        accessorKey: "qtyValveRem", 
        header: "VlvR", 
        size: 75, 
        cell: ({ getValue, row }) => (
          <InputCell
            value={getValue()}
            rowId={row.original.id}
            rowIndex={row.index}
            columnId="qtyValveRem"
            isNumeric={true}
            onUpdate={updateCell}
            onNavigate={navigateToCell}
            onFocus={handleCellFocus}
          />
        )
      },
      { 
        accessorKey: "qtyFlangeFix", 
        header: "FlgF", 
        size: 75, 
        cell: ({ getValue, row }) => (
          <InputCell
            value={getValue()}
            rowId={row.original.id}
            rowIndex={row.index}
            columnId="qtyFlangeFix"
            isNumeric={true}
            onUpdate={updateCell}
            onNavigate={navigateToCell}
            onFocus={handleCellFocus}
          />
        )
      },
      { 
        accessorKey: "qtyValveFix", 
        header: "VlvF", 
        size: 75, 
        cell: ({ getValue, row }) => (
          <InputCell
            value={getValue()}
            rowId={row.original.id}
            rowIndex={row.index}
            columnId="qtyValveFix"
            isNumeric={true}
            onUpdate={updateCell}
            onNavigate={navigateToCell}
            onFocus={handleCellFocus}
          />
        )
      },
      { 
        accessorKey: "qtyWeldValveFix", 
        header: "WVlv", 
        size: 75, 
        cell: ({ getValue, row }) => (
          <InputCell
            value={getValue()}
            rowId={row.original.id}
            rowIndex={row.index}
            columnId="qtyWeldValveFix"
            isNumeric={true}
            onUpdate={updateCell}
            onNavigate={navigateToCell}
            onFocus={handleCellFocus}
          />
        )
      },
      { 
        accessorKey: "totalFittingsLength", 
        header: "Fittings (m)", 
        size: 100, 
        cell: ({ getValue }) => (
          <div className="text-center text-sm font-semibold text-accent py-1">
            {(getValue() as number).toFixed(2)}
          </div>
        ),
      },
      { 
        accessorKey: "rmt", 
        header: "RMT (m)", 
        size: 100, 
        cell: ({ getValue }) => (
          <div className="text-center text-sm font-semibold text-accent py-1">
            {(getValue() as number).toFixed(2)}
          </div>
        ),
      },
      { 
        accessorKey: "area", 
        header: "Area (sqm)", 
        size: 110, 
        cell: ({ getValue }) => (
          <div className="text-center text-sm font-bold text-primary py-1">
            {(getValue() as number).toFixed(3)}
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        size: 50,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteRow(row.original.id)}
            disabled={data.length === 1}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        ),
      },
    ],
    [data.length, updateCell, navigateToCell, handleCellFocus, deleteRow]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    columnResizeMode: "onChange",
    state: { columnFilters, sorting, columnVisibility, columnSizing },
  });

  const totals = useMemo(() => {
    return data.reduce(
      (acc, row) => ({ rmt: acc.rmt + row.rmt, area: acc.area + row.area }),
      { rmt: 0, area: 0 }
    );
  }, [data]);

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-primary text-primary-foreground">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm opacity-90">Entries</div>
            <div className="text-2xl font-bold">{data.length}</div>
          </div>
          <div>
            <div className="text-sm opacity-90">Total RMT (m)</div>
            <div className="text-2xl font-bold">{totals.rmt.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm opacity-90">Total Area (sqm)</div>
            <div className="text-2xl font-bold">{totals.area.toFixed(3)}</div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3">
            <Button onClick={addRow} size="default" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Row
            </Button>
            <Button onClick={exportToExcel} size="default" variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Use Arrow keys, Tab, Enter to navigate cells
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="default" className="gap-2">
                <Settings2 className="h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 max-h-96 overflow-y-auto bg-popover z-50">
              {table.getAllColumns().filter((column) => column.getCanHide()).map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden" ref={tableRef}>
        <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>
          <Table style={{ width: table.getTotalSize() }}>
            <TableHeader className="sticky top-0 bg-card z-20">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className="border-r border-border last:border-r-0 py-2 text-sm font-semibold bg-muted/50"
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                <>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/30">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{ width: cell.column.getSize() }}
                          className="border-r border-border last:border-r-0 py-1 px-1"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/70 font-semibold sticky bottom-0">
                    {table.getAllColumns().map((column, index) => (
                      <TableCell key={column.id} className="border-r border-border last:border-r-0 py-2 text-sm">
                        {index === 0 ? (
                          <div className="text-center font-bold">TOTAL</div>
                        ) : column.id === "rmt" ? (
                          <div className="text-center font-bold">{totals.rmt.toFixed(2)}</div>
                        ) : column.id === "area" ? (
                          <div className="text-center font-bold">{totals.area.toFixed(3)}</div>
                        ) : null}
                      </TableCell>
                    ))}
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
