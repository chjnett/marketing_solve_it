import { create } from "zustand";

interface WorkspaceState {
  activeWorkspace: string;
  isSidebarCollapsed: boolean;
  workspaces: string[];
  setActiveWorkspace: (workspace: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  addWorkspace: (workspace: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspace: "Marketing Team",
  isSidebarCollapsed: false,
  workspaces: ["Marketing Team", "Personal Brand", "Tech Insights"],
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  addWorkspace: (workspace) => 
    set((state) => ({ 
      workspaces: [...state.workspaces, workspace],
      activeWorkspace: workspace 
    })),
}));
