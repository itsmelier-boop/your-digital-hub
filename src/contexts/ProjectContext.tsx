import { createContext, useContext, useState, ReactNode } from "react";

export interface Project {
  id: number;
  name: string;
  client: string;
  status: "Active" | "Completed" | "On Hold";
  orders: number;
  budget: string;
  createdDate: string;
  dueDate?: string;
  progress?: number;
  projectId?: string;
}

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, "id">) => void;
  updateProject: (id: number, updates: Partial<Project>) => void;
  deleteProject: (id: number) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const initialProjects: Project[] = [
  {
    id: 1,
    name: "Shivam Enterprises Project",
    client: "Shivam Enterprises",
    status: "Active",
    orders: 1,
    budget: "₹60,25,000",
    createdDate: "10/18/2025",
    dueDate: "2024-12-15",
    progress: 65,
    projectId: "PROJ-001"
  },
  {
    id: 2,
    name: "FG",
    client: "DCV",
    status: "Active",
    orders: 1,
    budget: "₹2,93,427",
    createdDate: "11/9/2025",
    dueDate: "2024-12-28",
    progress: 42,
    projectId: "PROJ-002"
  }
];

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const addProject = (project: Omit<Project, "id">) => {
    const newProject = {
      ...project,
      id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (id: number, updates: Partial<Project>) => {
    setProjects(projects.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProject = (id: number) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject, updateProject, deleteProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}
