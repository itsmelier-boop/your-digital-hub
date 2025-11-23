import { createContext, useContext, useState, ReactNode } from "react";

export interface MeasurementRow {
  id: string;
  checked: boolean;
  type: string;
  markNo: string;
  unitWeight: number;
  length: number;
  width: number;
  thickness: number;
  qty: number;
  weight: number;
}

export interface MeasurementSheet {
  itemId: string;
  orderId: string;
  projectId: string;
  rows: MeasurementRow[];
}

interface MeasurementContextType {
  measurements: MeasurementSheet[];
  getMeasurementSheet: (projectId: string, orderId: string, itemId: string) => MeasurementSheet | undefined;
  updateMeasurementSheet: (projectId: string, orderId: string, itemId: string, rows: MeasurementRow[]) => void;
  deleteMeasurementSheet: (projectId: string, orderId: string, itemId: string) => void;
}

const MeasurementContext = createContext<MeasurementContextType | undefined>(undefined);

export function MeasurementProvider({ children }: { children: ReactNode }) {
  const [measurements, setMeasurements] = useState<MeasurementSheet[]>([]);

  const getMeasurementSheet = (projectId: string, orderId: string, itemId: string) => {
    return measurements.find(
      m => m.projectId === projectId && m.orderId === orderId && m.itemId === itemId
    );
  };

  const updateMeasurementSheet = (projectId: string, orderId: string, itemId: string, rows: MeasurementRow[]) => {
    setMeasurements(prev => {
      const existing = prev.find(
        m => m.projectId === projectId && m.orderId === orderId && m.itemId === itemId
      );

      if (existing) {
        return prev.map(m =>
          m.projectId === projectId && m.orderId === orderId && m.itemId === itemId
            ? { ...m, rows }
            : m
        );
      } else {
        return [...prev, { projectId, orderId, itemId, rows }];
      }
    });
  };

  const deleteMeasurementSheet = (projectId: string, orderId: string, itemId: string) => {
    setMeasurements(prev =>
      prev.filter(m => !(m.projectId === projectId && m.orderId === orderId && m.itemId === itemId))
    );
  };

  return (
    <MeasurementContext.Provider
      value={{ measurements, getMeasurementSheet, updateMeasurementSheet, deleteMeasurementSheet }}
    >
      {children}
    </MeasurementContext.Provider>
  );
}

export function useMeasurements() {
  const context = useContext(MeasurementContext);
  if (context === undefined) {
    throw new Error("useMeasurements must be used within a MeasurementProvider");
  }
  return context;
}
