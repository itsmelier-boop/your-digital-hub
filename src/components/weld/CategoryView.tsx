import { useState } from "react";
import { WeldJoint, WeldCategory } from "@/types/weld";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  classifyBySize,
  classifyByMaterial,
  classifyByWeldType,
  classifyByWelder,
  classifyByStatus,
} from "@/utils/weldClassification";

interface CategoryViewProps {
  joints: WeldJoint[];
}

export const CategoryView = ({ joints }: CategoryViewProps) => {
  const [category, setCategory] = useState<WeldCategory>("material");

  const getClassifiedData = () => {
    switch (category) {
      case "size":
        return classifyBySize(joints);
      case "material":
        return classifyByMaterial(joints);
      case "weldType":
        return classifyByWeldType(joints);
      case "welder":
        return classifyByWelder(joints);
      case "status":
        return classifyByStatus(joints);
      default:
        return {};
    }
  };

  const classifiedData = getClassifiedData();
  const categories = Object.keys(classifiedData);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-600";
      case "rejected":
        return "bg-red-500/20 text-red-600";
      case "pending":
        return "bg-yellow-500/20 text-yellow-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Group by:</span>
        <Select value={category} onValueChange={(v) => setCategory(v as WeldCategory)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="material">Material</SelectItem>
            <SelectItem value="size">Size</SelectItem>
            <SelectItem value="weldType">Weld Type</SelectItem>
            <SelectItem value="welder">Welder</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {joints.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Add weld joints to see category breakdown
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card key={cat}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{cat}</span>
                  <Badge variant="secondary">{classifiedData[cat].length} joints</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {classifiedData[cat].map((joint) => (
                    <div
                      key={joint.id}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                    >
                      <span className="font-medium">{joint.jointNo}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{joint.size}"</span>
                        <Badge className={getStatusColor(joint.status)} variant="secondary">
                          {joint.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
