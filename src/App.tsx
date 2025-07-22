import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { AuthGuard } from "./components/auth/AuthGuard";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { TaskManager } from "./components/TaskManager";
import { ProjectManager } from "./components/ProjectManager";
import { NotificationManager } from "./components/NotificationManager";
import { ProjectPage } from "./pages/ProjectPage";
import { Goals } from "./components/Goals";
import { Settings } from "./components/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import InvitePage from "./pages/InvitePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Invite Route - Public but requires auth */}
            <Route path="/invite/:token" element={<InvitePage />} />
            
            {/* Main App Routes - Protected */}
            <Route path="/" element={
              <AuthGuard>
                <Layout>
                  <Outlet />
                </Layout>
              </AuthGuard>
            }>
              <Route index element={<Dashboard />} />
              <Route path="tasks" element={<TaskManager />} />
              <Route path="goals" element={<Goals />} />
              <Route path="projects" element={<ProjectManager />} />
              <Route path="projects/:projectId" element={<ProjectPage />} />
              <Route path="notifications" element={<NotificationManager />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
