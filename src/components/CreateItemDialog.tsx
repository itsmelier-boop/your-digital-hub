import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Milestone {
  id: string;
  name: string;
  percentage: number;
}

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemCreated: (item: any) => void;
}

export const CreateItemDialog = ({
  open,
  onOpenChange,
  onItemCreated,
}: CreateItemDialogProps) => {
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: "1", name: "Advance Payment", percentage: 100 }
  ]);

  const unitOfMeasurement = watch("unitOfMeasurement");
  const department = watch("department");

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      name: "",
      percentage: 0,
    };
    setMilestones([...milestones, newMilestone]);
  };

  const removeMilestone = (id: string) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((m) => m.id !== id));
    }
  };

  const updateMilestone = (id: string, field: "name" | "percentage", value: string | number) => {
    setMilestones(
      milestones.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      )
    );
  };

  const onSubmit = (data: any) => {
    const totalPercentage = milestones.reduce((sum, m) => sum + Number(m.percentage), 0);
    
    if (totalPercentage !== 100) {
      toast({
        title: "Invalid Billing Breakup",
        description: "Total percentage must equal 100%",
        variant: "destructive",
      });
      return;
    }

    const newItem = {
      id: `ITEM-${Date.now()}`,
      code: data.itemCode || "",
      description: data.itemDescription,
      unitOfMeasurement: data.unitOfMeasurement,
      department: data.department === "Others" ? data.customDepartment : data.department,
      quantity: parseFloat(data.quantity),
      unitRate: parseFloat(data.unitRate),
      amount: parseFloat(data.quantity) * parseFloat(data.unitRate),
      milestones: milestones,
      createdDate: new Date().toLocaleDateString("en-GB"),
    };

    onItemCreated(newItem);
    toast({
      title: "Success",
      description: "Item added successfully",
    });
    reset();
    setMilestones([{ id: "1", name: "Advance Payment", percentage: 100 }]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>
            Add a new work item to this order.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="itemCode">Item Code</Label>
            <Input
              id="itemCode"
              placeholder="e.g., S00995413"
              {...register("itemCode")}
            />
          </div>

          <div>
            <Label htmlFor="itemDescription">
              Item Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="itemDescription"
              placeholder="e.g., Structure Fabrication & Erection Work"
              required
              {...register("itemDescription", { required: true })}
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unitOfMeasurement">
                Unit of Measurement <span className="text-destructive">*</span>
              </Label>
              <Select
                required
                onValueChange={(value) => setValue("unitOfMeasurement", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MT">MT</SelectItem>
                  <SelectItem value="KG">KG</SelectItem>
                  <SelectItem value="PCS">PCS</SelectItem>
                  <SelectItem value="SQM">SQM</SelectItem>
                  <SelectItem value="RMT">RMT</SelectItem>
                  <SelectItem value="CUM">CUM</SelectItem>
                  <SelectItem value="LS">LS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department">
                Department <span className="text-destructive">*</span>
              </Label>
              <Select
                onValueChange={(value) => setValue("department", value)}
                defaultValue={watch("department")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="Structure">Structure</SelectItem>
                  <SelectItem value="Piping-LHS">Piping-LHS</SelectItem>
                  <SelectItem value="Piping-Spool Status">Piping-Spool Status</SelectItem>
                  <SelectItem value="Piping Insulation">Piping Insulation</SelectItem>
                  <SelectItem value="Equipment Insulation">Equipment Insulation</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {department === "Others" && (
            <div>
              <Label htmlFor="customDepartment">
                Custom Department <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customDepartment"
                placeholder="Enter custom department name"
                required={department === "Others"}
                {...register("customDepartment", { required: department === "Others" })}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">
                Quantity <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                required
                {...register("quantity", { required: true })}
              />
            </div>

            <div>
              <Label htmlFor="unitRate">
                Unit Rate (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="unitRate"
                type="number"
                step="0.01"
                required
                {...register("unitRate", { required: true })}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>
                Billing Breakup <span className="text-destructive">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMilestone}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Milestone
              </Button>
            </div>

            <div className="space-y-3">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="flex gap-3 items-start">
                  <Input
                    placeholder="Milestone name"
                    value={milestone.name}
                    onChange={(e) =>
                      updateMilestone(milestone.id, "name", e.target.value)
                    }
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={milestone.percentage}
                      onChange={(e) =>
                        updateMilestone(
                          milestone.id,
                          "percentage",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-24"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  {milestones.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMilestone(milestone.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <p className="text-sm text-muted-foreground">
                Total: {milestones.reduce((sum, m) => sum + Number(m.percentage), 0)}%
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Add Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
