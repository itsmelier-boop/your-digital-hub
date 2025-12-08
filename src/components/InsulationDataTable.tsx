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
import { Download, Plus, Trash2, Settings2, ArrowUpDown } from "lucide-react";
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

export const InsulationDataTable = () => {
  const [data, setData] = useState<PipeEntry[]>([createEmptyEntry(1)]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnSizing, setColumnSizing] = useState({});
  const [expressions, setExpressions] = useState<Record<string, string>>({});
  const [focusedCell, setFocusedCell] = useState<{ rowIndex: number; columnId: string } | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const columnSuggestions = useMemo(() => {
    const suggestions: Record<string, string[]> = {};
    EDITABLE_COLUMNS.forEach(col => {
      const values = data
        .map(row => String(row[col as keyof PipeEntry] || ''))
        .filter(v => v.trim() !== '' && v !== '0');
      suggestions[col] = [...new Set(values)];
    });
    return suggestions;
  }, [data]);

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
    const expressionKey = `${row.id}-${focusedCell.columnId}`;
    const textToCopy = expressions[expressionKey] || String(value);

    e.clipboardData?.setData('text/plain', textToCopy);
    e.preventDefault();
  }, [focusedCell, data, expressions]);

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

  const navigateToCell = useCallback((rowIndex: number, columnId: string, direction: 'up' | 'down' | 'left' | 'right' | 'next') => {
    const colIndex = EDITABLE_COLUMNS.indexOf(columnId);
    let newRowIndex = rowIndex;
    let newColIndex = colIndex;

    switch (direction) {
      case 'up':
        newRowIndex = Math.max(0, rowIndex - 1);
        break;
      case 'down':
        newRowIndex = Math.min(data.length - 1, rowIndex + 1);
        break;
      case 'left':
        newColIndex = Math.max(0, colIndex - 1);
        break;
      case 'right':
      case 'next':
        newColIndex = colIndex + 1;
        if (newColIndex >= EDITABLE_COLUMNS.length) {
          newColIndex = 0;
          newRowIndex = rowIndex + 1;
          if (newRowIndex >= data.length) {
            addRow();
            newRowIndex = data.length;
          }
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
    }, 0);
  }, [data.length, addRow]);

  const EditableCell = ({ getValue, row, column, table }: any) => {
    const initialValue = getValue();
    const [value, setValue] = useState(initialValue);
    const [isEditing, setIsEditing] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
    const expressionKey = `${row.original.id}-${column.id}`;
    const inputRef = useRef<HTMLInputElement>(null);
    const rowIndex = row.index;

    useEffect(() => {
      if (!isEditing) {
        setValue(initialValue);
      }
    }, [initialValue, isEditing]);

    const suggestions = useMemo(() => {
      if (!isEditing || typeof value !== 'string' || value.trim() === '') return [];
      const colSuggestions = columnSuggestions[column.id] || [];
      return colSuggestions
        .filter(s => s.toLowerCase().includes(value.toLowerCase()) && s !== value)
        .slice(0, 5);
    }, [value, isEditing, column.id]);

    useEffect(() => {
      setShowSuggestions(suggestions.length > 0);
      setSelectedSuggestionIndex(0);
    }, [suggestions]);

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

    const onFocus = () => {
      setIsEditing(true);
      setFocusedCell({ rowIndex, columnId: column.id });
      const isNumeric = typeof initialValue === "number";
      if (isNumeric && expressions[expressionKey]) {
        setValue(expressions[expressionKey]);
      }
    };

    const commitValue = () => {
      setIsEditing(false);
      setShowSuggestions(false);
      const isNumeric = typeof initialValue === "number";
      if (isNumeric) {
        const strValue = String(value);
        const evaluated = evaluateExpression(strValue);
        const finalValue = typeof evaluated === 'number' ? evaluated : parseFloat(strValue) || 0;
        
        if (strValue !== String(finalValue) && /[+\-*/()]/.test(strValue)) {
          setExpressions(prev => ({ ...prev, [expressionKey]: strValue }));
        } else {
          setExpressions(prev => {
            const newExpr = { ...prev };
            delete newExpr[expressionKey];
            return newExpr;
          });
        }
        
        setValue(finalValue);
        updateCell(row.original.id, column.id, finalValue);
      } else {
        updateCell(row.original.id, column.id, value);
      }
    };

    const onBlur = () => {
      setTimeout(() => {
        if (!inputRef.current?.contains(document.activeElement)) {
          commitValue();
        }
      }, 100);
    };

    const selectSuggestion = (suggestion: string) => {
      setValue(suggestion);
      setShowSuggestions(false);
      updateCell(row.original.id, column.id, suggestion);
      inputRef.current?.focus();
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (showSuggestions) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedSuggestionIndex(i => Math.min(i + 1, suggestions.length - 1));
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedSuggestionIndex(i => Math.max(i - 1, 0));
          return;
        }
        if (e.key === 'Enter' && suggestions[selectedSuggestionIndex]) {
          e.preventDefault();
          selectSuggestion(suggestions[selectedSuggestionIndex]);
          return;
        }
        if (e.key === 'Escape') {
          setShowSuggestions(false);
          return;
        }
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        commitValue();
        navigateToCell(rowIndex, column.id, 'down');
      } else if (e.key === 'Tab') {
        e.preventDefault();
        commitValue();
        navigateToCell(rowIndex, column.id, e.shiftKey ? 'left' : 'next');
      } else if (e.key === 'ArrowUp' && !showSuggestions) {
        e.preventDefault();
        commitValue();
        navigateToCell(rowIndex, column.id, 'up');
      } else if (e.key === 'ArrowDown' && !showSuggestions) {
        e.preventDefault();
        commitValue();
        navigateToCell(rowIndex, column.id, 'down');
      }
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    };

    if (column.id === "moc") {
      return (
        <Select value={value} onValueChange={(val) => { setValue(val); updateCell(row.original.id, column.id, val); }}>
          <SelectTrigger className="h-5 text-xs border-0 border-b border-border/30 rounded-none bg-transparent focus:border-primary/50 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {MOC_OPTIONS.map(moc => (
              <SelectItem key={moc} value={moc}>{moc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (column.id === "lineSize") {
      return (
        <Select value={value} onValueChange={(val) => { setValue(val); updateCell(row.original.id, column.id, val); }}>
          <SelectTrigger className="h-5 text-xs border-0 border-b border-border/30 rounded-none bg-transparent focus:border-primary/50 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {LINE_SIZES.map(size => (
              <SelectItem key={size} value={size}>NB{size}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (column.id === "insulationType") {
      return (
        <Select value={value} onValueChange={(val) => { setValue(val); updateCell(row.original.id, column.id, val); }}>
          <SelectTrigger className="h-5 text-xs border-0 border-b border-border/30 rounded-none bg-transparent focus:border-primary/50 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {INSULATION_TYPES.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    const isNumericField = typeof initialValue === "number";

    return (
      <div className="relative" data-row={rowIndex} data-col={column.id}>
        <input
          ref={inputRef}
          value={value ?? ''}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          type="text"
          inputMode={isNumericField ? "decimal" : "text"}
          className="w-full h-6 text-xs border border-border/40 rounded px-2 bg-background focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
        />
        {showSuggestions && (
          <div className="absolute z-50 top-full left-0 right-0 bg-popover border border-border rounded-md shadow-lg mt-1 max-h-32 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                className={`px-2 py-1 text-xs cursor-pointer hover:bg-accent ${
                  index === selectedSuggestionIndex ? 'bg-accent' : ''
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSuggestion(suggestion);
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const columns = useMemo<ColumnDef<PipeEntry>[]>(
    () => [
      {
        accessorKey: "srNo",
        header: "Sr.",
        size: 50,
        cell: EditableCell,
      },
      { accessorKey: "location", header: "Location", size: 120, cell: EditableCell },
      { accessorKey: "drawingNo", header: "Drawing", size: 100, cell: EditableCell },
      { accessorKey: "sheetNo", header: "Sheet", size: 80, cell: EditableCell },
      { accessorKey: "moc", header: "MOC", size: 80, cell: EditableCell },
      { accessorKey: "lineSize", header: "Size", size: 90, cell: EditableCell },
      { accessorKey: "pipeOD", header: "OD(mm)", size: 80, cell: EditableCell },
      { accessorKey: "insulationThickness", header: "Thk(mm)", size: 80, cell: EditableCell },
      { accessorKey: "insulationType", header: "Type", size: 100, cell: EditableCell },
      { accessorKey: "operatingTemp", header: "Temp°C", size: 80, cell: EditableCell },
      { accessorKey: "pipeLength", header: "Length(m)", size: 90, cell: EditableCell },
      { accessorKey: "qtyElbow90", header: "E90°", size: 60, cell: EditableCell },
      { accessorKey: "qtyElbow45", header: "E45°", size: 60, cell: EditableCell },
      { accessorKey: "qtyTee", header: "Tee", size: 50, cell: EditableCell },
      { accessorKey: "qtyReducer", header: "Red", size: 50, cell: EditableCell },
      { accessorKey: "qtyEndCap", header: "Cap", size: 50, cell: EditableCell },
      { accessorKey: "qtyFlangeRem", header: "FlgR", size: 55, cell: EditableCell },
      { accessorKey: "qtyValveRem", header: "VlvR", size: 55, cell: EditableCell },
      { accessorKey: "qtyFlangeFix", header: "FlgF", size: 55, cell: EditableCell },
      { accessorKey: "qtyValveFix", header: "VlvF", size: 55, cell: EditableCell },
      { accessorKey: "qtyWeldValveFix", header: "WVlv", size: 55, cell: EditableCell },
      { accessorKey: "totalFittingsLength", header: "Fit(m)", size: 70, cell: EditableCell },
      { accessorKey: "rmt", header: "RMT", size: 70, cell: EditableCell },
      { accessorKey: "area", header: "Area", size: 80, cell: EditableCell },
      {
        id: "actions",
        header: "",
        size: 40,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteRow(row.original.id)}
            disabled={data.length === 1}
            className="h-5 w-5 p-0"
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        ),
      },
    ],
    [data.length, columnSuggestions, expressions, focusedCell]
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
    <div className="space-y-3">
      <Card className="p-4 bg-primary text-primary-foreground">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs opacity-90">Entries</div>
            <div className="text-xl font-bold">{data.length}</div>
          </div>
          <div>
            <div className="text-xs opacity-90">Total RMT (m)</div>
            <div className="text-xl font-bold">{totals.rmt.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs opacity-90">Total Area (sqm)</div>
            <div className="text-xl font-bold">{totals.area.toFixed(3)}</div>
          </div>
        </div>
      </Card>

      <Card className="p-3">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            <Button onClick={addRow} size="sm" className="gap-2 h-7 text-xs">
              <Plus className="h-3 w-3" />
              Add Row
            </Button>
            <Button onClick={exportToExcel} size="sm" variant="outline" className="gap-2 h-7 text-xs">
              <Download className="h-3 w-3" />
              Export Excel
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-7 text-xs">
                <Settings2 className="h-3 w-3" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 max-h-96 overflow-y-auto bg-popover z-50">
              {table.getAllColumns().filter((column) => column.getCanHide()).map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize text-xs"
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
        <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
          <Table style={{ width: table.getTotalSize() }}>
            <TableHeader className="sticky top-0 bg-card z-20">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className="border-r border-border last:border-r-0 py-1 text-xs font-semibold bg-muted/50"
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
                    <TableRow key={row.id} className="hover:bg-muted/50">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{ width: cell.column.getSize() }}
                          className="border-r border-border last:border-r-0 py-0.5"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/70 font-semibold sticky bottom-0">
                    {table.getAllColumns().map((column, index) => (
                      <TableCell key={column.id} className="border-r border-border last:border-r-0 py-1 text-xs">
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
