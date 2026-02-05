 import { Toaster } from "@/components/ui/toaster";
 import { Toaster as Sonner } from "@/components/ui/sonner";
 import { TooltipProvider } from "@/components/ui/tooltip";
 import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
 import { BrowserRouter, Routes, Route } from "react-router-dom";
 import { AuthProvider } from "@/hooks/useAuth";
 import Index from "./pages/Index";
 import Explore from "./pages/Explore";
 import Auth from "./pages/Auth";
 import CenterDetails from "./pages/CenterDetails";
 import MyBookings from "./pages/MyBookings";
 import NotFound from "./pages/NotFound";
 import CenterDashboard from "./pages/center/CenterDashboard";
 import CenterOverview from "./pages/center/CenterOverview";
 import CenterBookings from "./pages/center/CenterBookings";
 import CenterCalendar from "./pages/center/CenterCalendar";
 import CenterServices from "./pages/center/CenterServices";
 import CenterDoctors from "./pages/center/CenterDoctors";
 import CenterAvailability from "./pages/center/CenterAvailability";
 import CenterAnalytics from "./pages/center/CenterAnalytics";
 import CenterSettings from "./pages/center/CenterSettings";

const queryClient = new QueryClient();

 const App = () => (
   <QueryClientProvider client={queryClient}>
     <TooltipProvider>
       <AuthProvider>
         <Toaster />
         <Sonner />
         <BrowserRouter>
           <Routes>
             <Route path="/" element={<Index />} />
             <Route path="/explore" element={<Explore />} />
             <Route path="/auth" element={<Auth />} />
             <Route path="/center/:id" element={<CenterDetails />} />
             <Route path="/bookings" element={<MyBookings />} />
             
             {/* Center Dashboard Routes */}
             <Route path="/center" element={<CenterDashboard />}>
               <Route index element={<CenterOverview />} />
               <Route path="bookings" element={<CenterBookings />} />
               <Route path="calendar" element={<CenterCalendar />} />
               <Route path="services" element={<CenterServices />} />
               <Route path="doctors" element={<CenterDoctors />} />
               <Route path="availability" element={<CenterAvailability />} />
               <Route path="analytics" element={<CenterAnalytics />} />
               <Route path="settings" element={<CenterSettings />} />
             </Route>
             
             {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
             <Route path="*" element={<NotFound />} />
           </Routes>
         </BrowserRouter>
       </AuthProvider>
     </TooltipProvider>
   </QueryClientProvider>
 );

export default App;
