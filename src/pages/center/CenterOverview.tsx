 import { useState, useEffect } from 'react';
 import { motion } from 'framer-motion';
 import {
   Calendar, Users, TrendingUp, Star, ArrowUpRight,
   ArrowDownRight, Clock, CheckCircle, XCircle
 } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/hooks/useAuth';
 import { format, startOfWeek, endOfWeek, isToday } from 'date-fns';
 
 interface Stats {
   totalBookings: number;
   todayBookings: number;
   weeklyBookings: number;
   averageRating: number;
   totalReviews: number;
   pendingBookings: number;
   completedBookings: number;
 }
 
 interface RecentBooking {
   id: string;
   booking_date: string;
   booking_time: string;
   status: string;
   service?: { name: string };
   profiles?: { full_name: string };
 }
 
 export default function CenterOverview() {
   const { user } = useAuth();
   const [stats, setStats] = useState<Stats>({
     totalBookings: 0,
     todayBookings: 0,
     weeklyBookings: 0,
     averageRating: 0,
     totalReviews: 0,
     pendingBookings: 0,
     completedBookings: 0,
   });
   const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
   const [centerId, setCenterId] = useState<string | null>(null);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     if (user) {
       fetchCenterData();
     }
   }, [user]);
 
   const fetchCenterData = async () => {
     try {
       // Get center for this owner
       const { data: center, error: centerError } = await supabase
         .from('centers')
         .select('id, average_rating, total_reviews, total_bookings')
         .eq('owner_id', user?.id)
         .maybeSingle();
 
       if (centerError) throw centerError;
       if (!center) {
         setLoading(false);
         return;
       }
 
       setCenterId(center.id);
 
       const today = format(new Date(), 'yyyy-MM-dd');
       const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');
       const weekEnd = format(endOfWeek(new Date()), 'yyyy-MM-dd');
 
       // Get booking stats
       const [todayResult, weeklyResult, pendingResult, completedResult, recentResult] = await Promise.all([
         supabase.from('bookings').select('id', { count: 'exact', head: true })
           .eq('center_id', center.id).eq('booking_date', today),
         supabase.from('bookings').select('id', { count: 'exact', head: true })
           .eq('center_id', center.id).gte('booking_date', weekStart).lte('booking_date', weekEnd),
         supabase.from('bookings').select('id', { count: 'exact', head: true })
           .eq('center_id', center.id).eq('status', 'pending'),
         supabase.from('bookings').select('id', { count: 'exact', head: true })
           .eq('center_id', center.id).eq('status', 'completed'),
         supabase.from('bookings')
           .select('id, booking_date, booking_time, status, service:services(name)')
           .eq('center_id', center.id)
           .order('created_at', { ascending: false })
           .limit(5),
       ]);
 
       setStats({
         totalBookings: center.total_bookings || 0,
         todayBookings: todayResult.count || 0,
         weeklyBookings: weeklyResult.count || 0,
         averageRating: center.average_rating || 0,
         totalReviews: center.total_reviews || 0,
         pendingBookings: pendingResult.count || 0,
         completedBookings: completedResult.count || 0,
       });
 
       setRecentBookings(recentResult.data || []);
     } catch (error) {
       console.error('Error fetching center data:', error);
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
 
   if (!centerId) {
     return (
       <div className="text-center py-12">
         <h2 className="text-2xl font-bold mb-4">No Center Found</h2>
         <p className="text-muted-foreground mb-4">
           You haven't created a center yet. Create one to start managing bookings.
         </p>
       </div>
     );
   }
 
   const statCards = [
     {
       title: "Today's Bookings",
       value: stats.todayBookings,
       icon: Calendar,
       color: 'text-primary',
       bgColor: 'bg-primary/10',
     },
     {
       title: 'This Week',
       value: stats.weeklyBookings,
       icon: TrendingUp,
       color: 'text-secondary',
       bgColor: 'bg-secondary/10',
     },
     {
       title: 'Pending',
       value: stats.pendingBookings,
       icon: Clock,
       color: 'text-amber-500',
       bgColor: 'bg-amber-500/10',
     },
     {
       title: 'Average Rating',
       value: stats.averageRating.toFixed(1),
       icon: Star,
       color: 'text-yellow-500',
       bgColor: 'bg-yellow-500/10',
       suffix: `(${stats.totalReviews} reviews)`,
     },
   ];
 
   return (
     <div className="space-y-6">
       <div>
         <h1 className="font-display text-2xl font-bold">Dashboard Overview</h1>
         <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
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
                     <p className="text-2xl font-bold mt-1">
                       {stat.value}
                       {stat.suffix && (
                         <span className="text-sm font-normal text-muted-foreground ml-1">
                           {stat.suffix}
                         </span>
                       )}
                     </p>
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
 
       {/* Recent Bookings */}
       <Card>
         <CardHeader>
           <CardTitle className="text-lg">Recent Bookings</CardTitle>
         </CardHeader>
         <CardContent>
           {recentBookings.length === 0 ? (
             <p className="text-muted-foreground text-center py-8">No bookings yet</p>
           ) : (
             <div className="space-y-3">
               {recentBookings.map((booking) => (
                 <div
                   key={booking.id}
                   className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                 >
                   <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${
                       booking.status === 'confirmed' ? 'bg-primary/10 text-primary' :
                       booking.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                       booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                       'bg-amber-500/10 text-amber-500'
                     }`}>
                       {booking.status === 'completed' ? <CheckCircle className="w-4 h-4" /> :
                        booking.status === 'cancelled' ? <XCircle className="w-4 h-4" /> :
                        <Clock className="w-4 h-4" />}
                     </div>
                     <div>
                       <p className="font-medium text-sm">
                         {booking.service?.name || 'Service'}
                       </p>
                       <p className="text-xs text-muted-foreground">
                         {format(new Date(booking.booking_date), 'MMM dd')} at {booking.booking_time}
                       </p>
                     </div>
                   </div>
                   <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                     booking.status === 'confirmed' ? 'bg-primary/10 text-primary' :
                     booking.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                     booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                     'bg-amber-500/10 text-amber-500'
                   }`}>
                     {booking.status}
                   </span>
                 </div>
               ))}
             </div>
           )}
         </CardContent>
       </Card>
     </div>
   );
 }