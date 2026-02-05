 import { useState, useEffect } from 'react';
 import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import {
   LayoutDashboard, Calendar, Users, Stethoscope, Clock,
   Settings, LogOut, Menu, X, ChevronRight, Bell, 
   BarChart3, CalendarDays
 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { useAuth } from '@/hooks/useAuth';
 import { cn } from '@/lib/utils';
 
 const sidebarItems = [
   { icon: LayoutDashboard, label: 'Overview', path: '/center' },
   { icon: Calendar, label: 'Bookings', path: '/center/bookings' },
   { icon: CalendarDays, label: 'Calendar', path: '/center/calendar' },
   { icon: Stethoscope, label: 'Services', path: '/center/services' },
   { icon: Users, label: 'Doctors', path: '/center/doctors' },
   { icon: Clock, label: 'Availability', path: '/center/availability' },
   { icon: BarChart3, label: 'Analytics', path: '/center/analytics' },
   { icon: Settings, label: 'Settings', path: '/center/settings' },
 ];
 
 export default function CenterDashboard() {
   const { user, role, signOut, loading } = useAuth();
   const navigate = useNavigate();
   const location = useLocation();
   const [sidebarOpen, setSidebarOpen] = useState(false);
 
   useEffect(() => {
     if (!loading && (!user || role !== 'center')) {
       navigate('/auth?role=center');
     }
   }, [user, role, loading, navigate]);
 
   if (loading) {
     return (
       <div className="min-h-screen flex items-center justify-center">
         <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
       </div>
     );
   }
 
   const handleSignOut = async () => {
     await signOut();
     navigate('/');
   };
 
   return (
     <div className="min-h-screen bg-background flex">
       {/* Mobile Sidebar Overlay */}
       {sidebarOpen && (
         <div
           className="fixed inset-0 bg-black/50 z-40 lg:hidden"
           onClick={() => setSidebarOpen(false)}
         />
       )}
 
       {/* Sidebar */}
       <aside
         className={cn(
           "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-300",
           sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
         )}
       >
         {/* Logo */}
         <div className="h-16 flex items-center justify-between px-4 border-b border-border">
           <Link to="/" className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg gradient-bg-primary flex items-center justify-center">
               <span className="text-lg">🌿</span>
             </div>
             <span className="font-display font-bold">AYUSH Center</span>
           </Link>
           <button
             onClick={() => setSidebarOpen(false)}
             className="lg:hidden p-2 hover:bg-muted rounded-lg"
           >
             <X className="w-5 h-5" />
           </button>
         </div>
 
         {/* Navigation */}
         <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
           {sidebarItems.map((item) => {
             const isActive = location.pathname === item.path || 
               (item.path !== '/center' && location.pathname.startsWith(item.path));
             return (
               <Link
                 key={item.path}
                 to={item.path}
                 onClick={() => setSidebarOpen(false)}
                 className={cn(
                   "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                   isActive
                     ? "bg-primary text-primary-foreground"
                     : "text-muted-foreground hover:bg-muted hover:text-foreground"
                 )}
               >
                 <item.icon className="w-5 h-5" />
                 {item.label}
               </Link>
             );
           })}
         </nav>
 
         {/* User Section */}
         <div className="p-4 border-t border-border">
           <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
               <span className="text-lg">👤</span>
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium truncate">{user?.email}</p>
               <p className="text-xs text-muted-foreground">Center Manager</p>
             </div>
           </div>
           <Button
             variant="outline"
             className="w-full justify-start gap-2"
             onClick={handleSignOut}
           >
             <LogOut className="w-4 h-4" />
             Sign Out
           </Button>
         </div>
       </aside>
 
       {/* Main Content */}
       <div className="flex-1 flex flex-col min-w-0">
         {/* Top Bar */}
         <header className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 bg-background z-30">
           <button
             onClick={() => setSidebarOpen(true)}
             className="lg:hidden p-2 hover:bg-muted rounded-lg"
           >
             <Menu className="w-5 h-5" />
           </button>
           
           <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="relative">
               <Bell className="w-5 h-5" />
               <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
             </Button>
           </div>
         </header>
 
         {/* Page Content */}
         <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
           <Outlet />
         </main>
       </div>
     </div>
   );
 }