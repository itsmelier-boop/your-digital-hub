import { Table as TanstackTable, flexRender } from "@tanstack/react-table";
import { EquipmentRow } from "@/types/equipment";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface EquipmentDataTableProps {
  table: TanstackTable<EquipmentRow>;
}

export const EquipmentDataTable = ({ table }: EquipmentDataTableProps) => {
  const onUpdateRow = (table.options.meta as any)?.onUpdateRow;

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{ width: header.getSize() }}
                  className="whitespace-nowrap bg-muted/50"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row, rowIndex) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => {
                const meta = cell.column.columnDef.meta as any;
                const field = cell.column.id as keyof EquipmentRow;

                if (meta?.isAction) {
                  return (
                    <TableCell key={cell.id} className="p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => {
                          const cellValue = cell.getValue() as any;
                          cellValue?.onDelete?.();
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  );
                }

                if (meta?.calculated) {
                  return (
                    <TableCell key={cell.id} className="bg-muted/30 font-medium text-right">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                }

                if (meta?.editable && meta?.type === "select") {
                  return (
                    <TableCell key={cell.id} className="p-1">
                      <Select
                        value={cell.getValue() as string}
                        onValueChange={(value) => onUpdateRow?.(row.original.id, field, value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {meta.options?.map((option: string) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  );
                }

                if (meta?.editable) {
                  return (
                    <TableCell key={cell.id} className="p-1">
                      <Input
                        data-cell-id={`${rowIndex}-${field}`}
                        className="h-8 text-xs"
                        value={cell.getValue() as string}
                        onChange={(e) => onUpdateRow?.(row.original.id, field, e.target.value)}
                        list={meta.suggestions?.length ? `${field}-suggestions` : undefined}
                      />
                      {meta.suggestions?.length > 0 && (
                        <datalist id={`${field}-suggestions`}>
                          {meta.suggestions.map((s: string) => (
                            <option key={s} value={s} />
                          ))}
                        </datalist>
                      )}
                    </TableCell>
                  );
                }

                return (
                  <TableCell key={cell.id} className="text-center font-medium">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
