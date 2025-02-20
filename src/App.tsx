
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ManageEarnings from "./pages/ManageEarnings";
import ManageSavings from "./pages/ManageSavings";
import ManageSpending from "./pages/ManageSpending";
import ManageLending from "./pages/ManageLending";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/manage-earnings" element={<ManageEarnings />} />
          <Route path="/manage-savings" element={<ManageSavings />} />
          <Route path="/manage-spending" element={<ManageSpending />} />
          <Route path="/manage-lending" element={<ManageLending />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
