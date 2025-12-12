import { createContext, useContext, useState, ReactNode } from "react";

export interface Milestone {
  id: string;
  name: string;
  percentage: number;
}

export interface Item {
  id: string;
  code: string;
  description: string;
  unitOfMeasurement: string;
  department: string;
  quantity: number;
  unitRate: number;
  amount: number;
  milestones: Milestone[];
  createdDate: string;
}

interface ItemContextType {
  items: Item[];
  addItem: (orderId: string, item: Item) => void;
  updateItem: (itemId: string, updates: Partial<Item>) => void;
  updateItemMilestones: (itemId: string, milestones: Milestone[]) => void;
  deleteItem: (itemId: string) => void;
  getItemsByOrder: (orderId: string) => Item[];
  getItem: (itemId: string) => Item | undefined;
}

interface StoredItem extends Item {
  orderId: string;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export function ItemProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<StoredItem[]>([]);

  const addItem = (orderId: string, item: Item) => {
    setItems(prev => [...prev, { ...item, orderId }]);
  };

  const updateItem = (itemId: string, updates: Partial<Item>) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  };

  const updateItemMilestones = (itemId: string, milestones: Milestone[]) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, milestones } : item
      )
    );
  };

  const deleteItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const getItemsByOrder = (orderId: string) => {
    return items.filter(item => item.orderId === orderId);
  };

  const getItem = (itemId: string) => {
    return items.find(item => item.id === itemId);
  };

  return (
    <ItemContext.Provider
      value={{
        items,
        addItem,
        updateItem,
        updateItemMilestones,
        deleteItem,
        getItemsByOrder,
        getItem,
      }}
    >
      {children}
    </ItemContext.Provider>
  );
}

export function useItems() {
  const context = useContext(ItemContext);
  if (context === undefined) {
    throw new Error("useItems must be used within an ItemProvider");
  }
  return context;
}
