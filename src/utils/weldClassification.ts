import { WeldJoint } from "@/types/weld";

export const classifyBySize = (joints: WeldJoint[]) => {
  const categories: Record<string, WeldJoint[]> = {};
  joints.forEach((joint) => {
    const key = `${joint.size}"`;
    if (!categories[key]) categories[key] = [];
    categories[key].push(joint);
  });
  return categories;
};

export const classifyByMaterial = (joints: WeldJoint[]) => {
  const categories: Record<string, WeldJoint[]> = {};
  joints.forEach((joint) => {
    if (!categories[joint.material]) categories[joint.material] = [];
    categories[joint.material].push(joint);
  });
  return categories;
};

export const classifyByWeldType = (joints: WeldJoint[]) => {
  const categories: Record<string, WeldJoint[]> = {};
  joints.forEach((joint) => {
    if (!categories[joint.weldType]) categories[joint.weldType] = [];
    categories[joint.weldType].push(joint);
  });
  return categories;
};

export const classifyByWelder = (joints: WeldJoint[]) => {
  const categories: Record<string, WeldJoint[]> = {};
  joints.forEach((joint) => {
    if (!categories[joint.welder]) categories[joint.welder] = [];
    categories[joint.welder].push(joint);
  });
  return categories;
};

export const classifyByStatus = (joints: WeldJoint[]) => {
  const categories: Record<string, WeldJoint[]> = {};
  joints.forEach((joint) => {
    if (!categories[joint.status]) categories[joint.status] = [];
    categories[joint.status].push(joint);
  });
  return categories;
};

export const exportToCSV = (joints: WeldJoint[]): string => {
  const headers = [
    "Sl No",
    "Joint No",
    "Line No",
    "Size",
    "Schedule",
    "Material",
    "Weld Type",
    "Welder",
    "Date",
    "Status",
    "Remarks",
  ];

  const rows = joints.map((joint) => [
    joint.slNo,
    joint.jointNo,
    joint.lineNo,
    joint.size,
    joint.schedule,
    joint.material,
    joint.weldType,
    joint.welder,
    joint.date,
    joint.status,
    joint.remarks,
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
};

export const getStatistics = (joints: WeldJoint[]) => {
  const totalJoints = joints.length;
  const completedJoints = joints.filter((j) => j.status === "completed").length;
  const pendingJoints = joints.filter((j) => j.status === "pending").length;
  const rejectedJoints = joints.filter((j) => j.status === "rejected").length;

  const uniqueWelders = new Set(joints.map((j) => j.welder)).size;
  const uniqueMaterials = new Set(joints.map((j) => j.material)).size;

  return {
    totalJoints,
    completedJoints,
    pendingJoints,
    rejectedJoints,
    uniqueWelders,
    uniqueMaterials,
    completionRate: totalJoints > 0 ? (completedJoints / totalJoints) * 100 : 0,
  };
};
