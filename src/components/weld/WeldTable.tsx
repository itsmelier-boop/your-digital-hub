import { useState } from "react";
import { WeldJoint } from "@/types/weld";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface WeldTableProps {
  joints: WeldJoint[];
  onAdd: (joint: WeldJoint) => void;
  onDelete: (id: string) => void;
  nextSlNo: number;
}

const MATERIALS = ["CS", "SS304", "SS316", "Duplex", "Inconel"];
const WELD_TYPES = ["Butt", "Socket", "Fillet", "Branch"];
const SCHEDULES = ["SCH10", "SCH20", "SCH40", "SCH80", "SCH160", "XXS"];
const SIZES = [0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24];

export const WeldTable = ({ joints, onAdd, onDelete, nextSlNo }: WeldTableProps) => {
  const [newJoint, setNewJoint] = useState<Partial<WeldJoint>>({
    jointNo: "",
    lineNo: "",
    size: 2,
    schedule: "SCH40",
    material: "CS",
    weldType: "Butt",
    welder: "",
    date: new Date().toISOString().split("T")[0],
    status: "pending",
    remarks: "",
  });

  const handleAdd = () => {
    if (!newJoint.jointNo || !newJoint.lineNo || !newJoint.welder) {
      toast.error("Please fill in Joint No, Line No, and Welder");
      return;
    }

    const joint: WeldJoint = {
      id: crypto.randomUUID(),
      slNo: nextSlNo,
      jointNo: newJoint.jointNo!,
      lineNo: newJoint.lineNo!,
      size: newJoint.size!,
      schedule: newJoint.schedule!,
      material: newJoint.material!,
      weldType: newJoint.weldType!,
      welder: newJoint.welder!,
      date: newJoint.date!,
      status: newJoint.status as "pending" | "completed" | "rejected",
      remarks: newJoint.remarks || "",
    };

    onAdd(joint);
    setNewJoint({
      jointNo: "",
      lineNo: "",
      size: 2,
      schedule: "SCH40",
      material: "CS",
      weldType: "Butt",
      welder: "",
      date: new Date().toISOString().split("T")[0],
      status: "pending",
      remarks: "",
    });
    toast.success("Joint added successfully");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-600">Completed</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-600">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-600">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weld Joint Data Entry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Joint Form */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4 bg-muted/50 rounded-lg">
          <Input
            placeholder="Joint No *"
            value={newJoint.jointNo}
            onChange={(e) => setNewJoint({ ...newJoint, jointNo: e.target.value })}
          />
          <Input
            placeholder="Line No *"
            value={newJoint.lineNo}
            onChange={(e) => setNewJoint({ ...newJoint, lineNo: e.target.value })}
          />
          <Select
            value={String(newJoint.size)}
            onValueChange={(v) => setNewJoint({ ...newJoint, size: Number(v) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {SIZES.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}"
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={newJoint.schedule}
            onValueChange={(v) => setNewJoint({ ...newJoint, schedule: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Schedule" />
            </SelectTrigger>
            <SelectContent>
              {SCHEDULES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={newJoint.material}
            onValueChange={(v) => setNewJoint({ ...newJoint, material: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Material" />
            </SelectTrigger>
            <SelectContent>
              {MATERIALS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={newJoint.weldType}
            onValueChange={(v) => setNewJoint({ ...newJoint, weldType: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Weld Type" />
            </SelectTrigger>
            <SelectContent>
              {WELD_TYPES.map((w) => (
                <SelectItem key={w} value={w}>
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Welder *"
            value={newJoint.welder}
            onChange={(e) => setNewJoint({ ...newJoint, welder: e.target.value })}
          />
          <Input
            type="date"
            value={newJoint.date}
            onChange={(e) => setNewJoint({ ...newJoint, date: e.target.value })}
          />
          <Select
            value={newJoint.status}
            onValueChange={(v) => setNewJoint({ ...newJoint, status: v as "pending" | "completed" | "rejected" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Remarks"
            value={newJoint.remarks}
            onChange={(e) => setNewJoint({ ...newJoint, remarks: e.target.value })}
          />
          <Button onClick={handleAdd} className="col-span-2">
            <Plus className="mr-2 h-4 w-4" />
            Add Joint
          </Button>
        </div>

        {/* Data Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Sl No</TableHead>
                <TableHead>Joint No</TableHead>
                <TableHead>Line No</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Weld Type</TableHead>
                <TableHead>Welder</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead className="w-12">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {joints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center text-muted-foreground py-8">
                    No weld joints added yet. Add your first joint above.
                  </TableCell>
                </TableRow>
              ) : (
                joints.map((joint) => (
                  <TableRow key={joint.id}>
                    <TableCell>{joint.slNo}</TableCell>
                    <TableCell className="font-medium">{joint.jointNo}</TableCell>
                    <TableCell>{joint.lineNo}</TableCell>
                    <TableCell>{joint.size}"</TableCell>
                    <TableCell>{joint.schedule}</TableCell>
                    <TableCell>{joint.material}</TableCell>
                    <TableCell>{joint.weldType}</TableCell>
                    <TableCell>{joint.welder}</TableCell>
                    <TableCell>{joint.date}</TableCell>
                    <TableCell>{getStatusBadge(joint.status)}</TableCell>
                    <TableCell>{joint.remarks}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(joint.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
