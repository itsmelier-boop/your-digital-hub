import { createContext, useContext, useState, ReactNode } from "react";

export interface Order {
  id: string;
  projectId: number;
  name: string;
  description: string;
  status: "Active" | "Completed" | "On Hold";
  items: number;
  amount: string;
  createdDate: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "createdDate">) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  getOrdersByProject: (projectId: number) => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const initialOrders: Order[] = [
  {
    id: "ORD-001",
    projectId: 1,
    name: "Main Construction Work",
    description: "Primary construction activities including structure, piping and cable tray work",
    status: "Active",
    items: 2,
    amount: "₹60,25,000",
    createdDate: "10/18/2025"
  },
  {
    id: "ORD-002",
    projectId: 2,
    name: "Initial Setup Work",
    description: "Foundation and basic infrastructure setup",
    status: "Active",
    items: 1,
    amount: "₹2,93,427",
    createdDate: "11/9/2025"
  }
];

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const addOrder = (order: Omit<Order, "id" | "createdDate">) => {
    const newOrder = {
      ...order,
      id: `ORD-${Date.now()}`,
      createdDate: new Date().toLocaleDateString("en-GB"),
    };
    setOrders([...orders, newOrder]);
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(orders.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const deleteOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  const getOrdersByProject = (projectId: number) => {
    return orders.filter(o => o.projectId === projectId);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrder, deleteOrder, getOrdersByProject }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}
