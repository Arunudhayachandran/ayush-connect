 import { useState, useEffect } from 'react';
 import { motion } from 'framer-motion';
 import {
   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
   PieChart, Pie, Cell, LineChart, Line
 } from 'recharts';
 import { Calendar, TrendingUp, DollarSign, Star } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/hooks/useAuth';
 import { format, subDays, eachDayOfInterval } from 'date-fns';
 
 interface Analytics {
   totalRevenue: number;
   totalBookings: number;
   averageRating: number;
   completionRate: number;
   dailyBookings: { date: string; count: number }[];
   serviceBreakdown: { name: string; count: number }[];
 }
 
 const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444'];
 
 export default function CenterAnalytics() {
   const { user } = useAuth();
   const [analytics, setAnalytics] = useState<Analytics>({
     totalRevenue: 0,
     totalBookings: 0,
     averageRating: 0,
     completionRate: 0,
     dailyBookings: [],
     serviceBreakdown: [],
   });
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     if (user) {
       fetchAnalytics();
     }
   }, [user]);
 
   const fetchAnalytics = async () => {
     try {
       const { data: center } = await supabase
         .from('centers')
         .select('id, average_rating, total_reviews, total_bookings')
         .eq('owner_id', user?.id)
         .maybeSingle();
 
       if (!center) {
         setLoading(false);
         return;
       }
 
       const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
 
       // Fetch bookings for last 30 days
       const { data: bookings } = await supabase
         .from('bookings')
         .select('id, booking_date, status, total_amount, service:services(name)')
         .eq('center_id', center.id)
         .gte('booking_date', thirtyDaysAgo);
 
       // Calculate daily bookings
       const last30Days = eachDayOfInterval({
         start: subDays(new Date(), 29),
         end: new Date(),
       });
 
       const dailyBookings = last30Days.map((date) => {
         const dateStr = format(date, 'yyyy-MM-dd');
         const count = bookings?.filter((b) => b.booking_date === dateStr).length || 0;
         return { date: format(date, 'MMM dd'), count };
       });
 
       // Calculate service breakdown
       const serviceCount: Record<string, number> = {};
       bookings?.forEach((b) => {
         const name = b.service?.name || 'Unknown';
         serviceCount[name] = (serviceCount[name] || 0) + 1;
       });
       const serviceBreakdown = Object.entries(serviceCount)
         .map(([name, count]) => ({ name, count }))
         .sort((a, b) => b.count - a.count)
         .slice(0, 5);
 
       // Calculate metrics
       const totalRevenue = bookings
         ?.filter((b) => b.status === 'completed')
         .reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
 
       const completedBookings = bookings?.filter((b) => b.status === 'completed').length || 0;
       const totalBookingsCount = bookings?.length || 0;
       const completionRate = totalBookingsCount > 0 
         ? Math.round((completedBookings / totalBookingsCount) * 100) 
         : 0;
 
       setAnalytics({
         totalRevenue,
         totalBookings: center.total_bookings || 0,
         averageRating: center.average_rating || 0,
         completionRate,
         dailyBookings,
         serviceBreakdown,
       });
     } catch (error) {
       console.error('Error fetching analytics:', error);
     } finally {
       setLoading(false);
     }
   };
 
   if (loading) {
     return (
       <div className="flex items-center justify-center h-64">
         <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
       </div>
     );
   }
 
   const statCards = [
     {
       title: 'Total Bookings',
       value: analytics.totalBookings,
       icon: Calendar,
       color: 'text-primary',
       bgColor: 'bg-primary/10',
     },
     {
       title: 'Revenue (30d)',
       value: `₹${analytics.totalRevenue.toLocaleString()}`,
       icon: DollarSign,
       color: 'text-green-500',
       bgColor: 'bg-green-500/10',
     },
     {
       title: 'Average Rating',
       value: analytics.averageRating.toFixed(1),
       icon: Star,
       color: 'text-yellow-500',
       bgColor: 'bg-yellow-500/10',
     },
     {
       title: 'Completion Rate',
       value: `${analytics.completionRate}%`,
       icon: TrendingUp,
       color: 'text-secondary',
       bgColor: 'bg-secondary/10',
     },
   ];
 
   return (
     <div className="space-y-6">
       <div>
         <h1 className="font-display text-2xl font-bold">Analytics</h1>
         <p className="text-muted-foreground">Track your center's performance</p>
       </div>
 
       {/* Stats Grid */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         {statCards.map((stat, index) => (
           <motion.div
             key={stat.title}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: index * 0.1 }}
           >
             <Card>
               <CardContent className="pt-6">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-muted-foreground">{stat.title}</p>
                     <p className="text-2xl font-bold mt-1">{stat.value}</p>
                   </div>
                   <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                     <stat.icon className={`w-6 h-6 ${stat.color}`} />
                   </div>
                 </div>
               </CardContent>
             </Card>
           </motion.div>
         ))}
       </div>
 
       {/* Charts Row */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Daily Bookings Chart */}
         <Card>
           <CardHeader>
             <CardTitle className="text-lg">Bookings (Last 30 Days)</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={analytics.dailyBookings}>
                   <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                   <XAxis 
                     dataKey="date" 
                     tick={{ fontSize: 10 }}
                     interval={4}
                     className="text-muted-foreground"
                   />
                   <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                   <Tooltip
                     contentStyle={{
                       backgroundColor: 'hsl(var(--card))',
                       border: '1px solid hsl(var(--border))',
                       borderRadius: '8px',
                     }}
                   />
                   <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </CardContent>
         </Card>
 
         {/* Service Breakdown */}
         <Card>
           <CardHeader>
             <CardTitle className="text-lg">Popular Services</CardTitle>
           </CardHeader>
           <CardContent>
             {analytics.serviceBreakdown.length === 0 ? (
               <p className="text-muted-foreground text-center py-8">No data yet</p>
             ) : (
               <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={analytics.serviceBreakdown}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="count"
                       nameKey="name"
                       label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                       labelLine={false}
                     >
                       {analytics.serviceBreakdown.map((entry, index) => (
                         <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
             )}
           </CardContent>
         </Card>
       </div>
     </div>
   );
 }