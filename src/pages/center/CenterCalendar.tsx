 import { useState, useEffect } from 'react';
 import { motion } from 'framer-motion';
 import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/hooks/useAuth';
 import {
   format,
   startOfWeek,
   endOfWeek,
   eachDayOfInterval,
   addWeeks,
   subWeeks,
   isToday,
   isSameDay,
   parseISO,
 } from 'date-fns';
 import { cn } from '@/lib/utils';
 
 interface CalendarBooking {
   id: string;
   booking_date: string;
   booking_time: string;
   status: string;
   service: { name: string } | null;
 }
 
 export default function CenterCalendar() {
   const { user } = useAuth();
   const [currentDate, setCurrentDate] = useState(new Date());
   const [bookings, setBookings] = useState<CalendarBooking[]>([]);
   const [loading, setLoading] = useState(true);
   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
 
   const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
   const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
   const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
 
   useEffect(() => {
     if (user) {
       fetchBookings();
     }
   }, [user, currentDate]);
 
   const fetchBookings = async () => {
     try {
       const { data: center } = await supabase
         .from('centers')
         .select('id')
         .eq('owner_id', user?.id)
         .maybeSingle();
 
       if (!center) {
         setLoading(false);
         return;
       }
 
       const { data, error } = await supabase
         .from('bookings')
         .select('id, booking_date, booking_time, status, service:services(name)')
         .eq('center_id', center.id)
         .gte('booking_date', format(weekStart, 'yyyy-MM-dd'))
         .lte('booking_date', format(weekEnd, 'yyyy-MM-dd'))
         .order('booking_time');
 
       if (error) throw error;
       setBookings(data || []);
     } catch (error) {
       console.error('Error fetching bookings:', error);
     } finally {
       setLoading(false);
     }
   };
 
   const getBookingsForDate = (date: Date) => {
     return bookings.filter((b) => isSameDay(parseISO(b.booking_date), date));
   };
 
   const getStatusColor = (status: string) => {
     switch (status) {
       case 'confirmed': return 'bg-primary text-primary-foreground';
       case 'completed': return 'bg-green-500 text-white';
       case 'cancelled': return 'bg-destructive/20 text-destructive line-through';
       default: return 'bg-amber-500/20 text-amber-700';
     }
   };
 
   const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];
 
   if (loading) {
     return (
       <div className="flex items-center justify-center h-64">
         <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       <div>
         <h1 className="font-display text-2xl font-bold">Booking Calendar</h1>
         <p className="text-muted-foreground">View your appointments by week</p>
       </div>
 
       {/* Week Navigation */}
       <div className="flex items-center justify-between">
         <Button variant="outline" size="icon" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
           <ChevronLeft className="w-4 h-4" />
         </Button>
         <h2 className="font-semibold">
           {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
         </h2>
         <Button variant="outline" size="icon" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
           <ChevronRight className="w-4 h-4" />
         </Button>
       </div>
 
       {/* Calendar Grid */}
       <div className="grid grid-cols-7 gap-2">
         {weekDays.map((day) => {
           const dayBookings = getBookingsForDate(day);
           const isSelected = selectedDate && isSameDay(day, selectedDate);
           
           return (
             <motion.div
               key={day.toISOString()}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className={cn(
                 'min-h-[120px] p-2 rounded-lg border cursor-pointer transition-colors',
                 isToday(day) && 'border-primary',
                 isSelected && 'bg-primary/5 border-primary',
                 !isSelected && !isToday(day) && 'border-border hover:border-muted-foreground'
               )}
               onClick={() => setSelectedDate(day)}
             >
               <div className="text-center mb-2">
                 <p className="text-xs text-muted-foreground">{format(day, 'EEE')}</p>
                 <p className={cn(
                   'text-lg font-semibold',
                   isToday(day) && 'text-primary'
                 )}>
                   {format(day, 'd')}
                 </p>
               </div>
               <div className="space-y-1">
                 {dayBookings.slice(0, 3).map((booking) => (
                   <div
                     key={booking.id}
                     className={cn(
                       'text-xs px-1.5 py-0.5 rounded truncate',
                       getStatusColor(booking.status)
                     )}
                   >
                     {booking.booking_time.slice(0, 5)}
                   </div>
                 ))}
                 {dayBookings.length > 3 && (
                   <p className="text-xs text-muted-foreground text-center">
                     +{dayBookings.length - 3} more
                   </p>
                 )}
               </div>
             </motion.div>
           );
         })}
       </div>
 
       {/* Selected Day Details */}
       {selectedDate && (
         <Card>
           <CardHeader>
             <CardTitle className="text-lg">
               {format(selectedDate, 'EEEE, MMMM d')}
               {isToday(selectedDate) && (
                 <span className="ml-2 text-xs font-normal bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                   Today
                 </span>
               )}
             </CardTitle>
           </CardHeader>
           <CardContent>
             {selectedDateBookings.length === 0 ? (
               <p className="text-muted-foreground text-center py-4">No bookings for this day</p>
             ) : (
               <div className="space-y-3">
                 {selectedDateBookings.map((booking) => (
                   <div
                     key={booking.id}
                     className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                   >
                     <div className="flex items-center gap-2">
                       <Clock className="w-4 h-4 text-muted-foreground" />
                       <span className="font-medium">{booking.booking_time.slice(0, 5)}</span>
                     </div>
                     <div className="flex-1">
                       <p className="font-medium">{booking.service?.name || 'Service'}</p>
                     </div>
                     <span className={cn(
                       'text-xs px-2 py-1 rounded-full capitalize',
                       getStatusColor(booking.status)
                     )}>
                       {booking.status}
                     </span>
                   </div>
                 ))}
               </div>
             )}
           </CardContent>
         </Card>
       )}
     </div>
   );
 }