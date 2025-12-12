import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { MeasurementProvider } from "@/contexts/MeasurementContext";
import { ItemProvider } from "@/contexts/ItemContext";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import OrderItems from "./pages/OrderItems";
import MeasurementSheet from "./pages/MeasurementSheet";
import BillingQuantityEntry from "./pages/BillingQuantityEntry";
import PipingSpoolStatus from "./pages/PipingSpoolStatus";
import EquipmentInsulation from "./pages/EquipmentInsulation";
import PipingInsulation from "./pages/PipingInsulation";
import BillingAbstract from "./pages/BillingAbstract";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ProjectProvider>
        <OrderProvider>
          <ItemProvider>
            <MeasurementProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:projectId" element={<ProjectDetails />} />
                  <Route path="/projects/:projectId/orders/:orderId" element={<OrderItems />} />
                  <Route path="/projects/:projectId/orders/:orderId/items/:itemId/measure" element={<MeasurementSheet />} />
                  <Route path="/projects/:projectId/orders/:orderId/items/:itemId/billing-entry" element={<BillingQuantityEntry />} />
                  <Route path="/projects/:projectId/orders/:orderId/items/:itemId/spool-status" element={<PipingSpoolStatus />} />
                  <Route path="/projects/:projectId/orders/:orderId/items/:itemId/equipment-insulation" element={<EquipmentInsulation />} />
                  <Route path="/projects/:projectId/orders/:orderId/items/:itemId/piping-insulation" element={<PipingInsulation />} />
                  <Route path="/projects/:projectId/orders/:orderId/abstract" element={<BillingAbstract />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </MeasurementProvider>
          </ItemProvider>
        </OrderProvider>
      </ProjectProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
