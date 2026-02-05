 import { useState, useEffect } from 'react';
 import { motion } from 'framer-motion';
 import { format, isToday, isTomorrow, parseISO } from 'date-fns';
 import {
   Search, Filter, CheckCircle, XCircle, Clock,
   Calendar, User, ChevronDown, MoreVertical
 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/hooks/useAuth';
 import { useToast } from '@/hooks/use-toast';
 import { cn } from '@/lib/utils';
 
 type BookingStatus = 'pending' | 'pending_payment' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'refunded';
 
 interface Booking {
   id: string;
   booking_date: string;
   booking_time: string;
   status: BookingStatus;
   notes: string | null;
   total_amount: number | null;
   created_at: string;
   service: { name: string; duration_minutes: number } | null;
   doctor: { name: string } | null;
 }
 
 const statusFilters: { value: BookingStatus | 'all'; label: string }[] = [
   { value: 'all', label: 'All Bookings' },
   { value: 'pending', label: 'Pending' },
   { value: 'confirmed', label: 'Confirmed' },
   { value: 'completed', label: 'Completed' },
   { value: 'cancelled', label: 'Cancelled' },
 ];
 
 export default function CenterBookings() {
   const { user } = useAuth();
   const { toast } = useToast();
   const [bookings, setBookings] = useState<Booking[]>([]);
   const [loading, setLoading] = useState(true);
   const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
   const [searchQuery, setSearchQuery] = useState('');
   const [centerId, setCenterId] = useState<string | null>(null);
 
   useEffect(() => {
     if (user) {
       fetchCenterAndBookings();
     }
   }, [user, statusFilter]);
 
   const fetchCenterAndBookings = async () => {
     try {
       // Get center for this owner
       const { data: center } = await supabase
         .from('centers')
         .select('id')
         .eq('owner_id', user?.id)
         .maybeSingle();
 
       if (!center) {
         setLoading(false);
         return;
       }
 
       setCenterId(center.id);
 
       let query = supabase
         .from('bookings')
         .select(`
           id, booking_date, booking_time, status, notes, total_amount, created_at,
           service:services(name, duration_minutes),
           doctor:doctors(name)
         `)
         .eq('center_id', center.id)
         .order('booking_date', { ascending: true })
         .order('booking_time', { ascending: true });
 
       if (statusFilter !== 'all') {
         query = query.eq('status', statusFilter);
       }
 
       const { data, error } = await query;
 
       if (error) throw error;
       setBookings(data || []);
     } catch (error) {
       console.error('Error fetching bookings:', error);
     } finally {
       setLoading(false);
     }
   };
 
   const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
     try {
       const { error } = await supabase
         .from('bookings')
         .update({ 
           status: newStatus,
           ...(newStatus === 'cancelled' ? { cancelled_at: new Date().toISOString() } : {})
         })
         .eq('id', bookingId);
 
       if (error) throw error;
 
       toast({
         title: 'Status Updated',
         description: `Booking marked as ${newStatus}`,
       });
 
       fetchCenterAndBookings();
     } catch (error: any) {
       toast({
         title: 'Error',
         description: error.message,
         variant: 'destructive',
       });
     }
   };
 
   const getDateLabel = (dateStr: string) => {
     const date = parseISO(dateStr);
     if (isToday(date)) return 'Today';
     if (isTomorrow(date)) return 'Tomorrow';
     return format(date, 'EEE, MMM dd');
   };
 
   const getStatusColor = (status: BookingStatus) => {
     switch (status) {
       case 'confirmed': return 'bg-primary/10 text-primary';
       case 'completed': return 'bg-green-500/10 text-green-500';
       case 'cancelled': return 'bg-destructive/10 text-destructive';
       case 'no_show': return 'bg-muted text-muted-foreground';
       default: return 'bg-amber-500/10 text-amber-500';
     }
   };
 
   const groupedBookings = bookings.reduce((acc, booking) => {
     const date = booking.booking_date;
     if (!acc[date]) acc[date] = [];
     acc[date].push(booking);
     return acc;
   }, {} as Record<string, Booking[]>);
 
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
         <h1 className="font-display text-2xl font-bold">Bookings</h1>
         <p className="text-muted-foreground">Manage your center's appointments</p>
       </div>
 
       {/* Filters */}
       <div className="flex flex-col sm:flex-row gap-4">
         <div className="relative flex-1 max-w-sm">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <Input
             placeholder="Search bookings..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="pl-9"
           />
         </div>
         <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
           {statusFilters.map((filter) => (
             <Button
               key={filter.value}
               variant={statusFilter === filter.value ? 'default' : 'outline'}
               size="sm"
               onClick={() => setStatusFilter(filter.value)}
               className="whitespace-nowrap"
             >
               {filter.label}
             </Button>
           ))}
         </div>
       </div>
 
       {/* Bookings List */}
       {Object.keys(groupedBookings).length === 0 ? (
         <Card>
           <CardContent className="py-12 text-center">
             <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
             <p className="text-muted-foreground">No bookings found</p>
           </CardContent>
         </Card>
       ) : (
         <div className="space-y-6">
           {Object.entries(groupedBookings).map(([date, dayBookings]) => (
             <div key={date}>
               <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                 <Calendar className="w-4 h-4" />
                 {getDateLabel(date)}
                 <span className="px-2 py-0.5 rounded-full bg-muted text-xs">
                   {dayBookings.length} bookings
                 </span>
               </h3>
               <div className="space-y-3">
                 {dayBookings.map((booking, index) => (
                   <motion.div
                     key={booking.id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: index * 0.05 }}
                   >
                     <Card>
                       <CardContent className="p-4">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                             <div className="text-center">
                               <p className="text-lg font-bold">
                                 {booking.booking_time.slice(0, 5)}
                               </p>
                               <p className="text-xs text-muted-foreground">
                                 {booking.service?.duration_minutes || 30} min
                               </p>
                             </div>
                             <div className="h-12 w-px bg-border" />
                             <div>
                               <p className="font-medium">
                                 {booking.service?.name || 'Service'}
                               </p>
                               {booking.doctor && (
                                 <p className="text-sm text-muted-foreground">
                                   with Dr. {booking.doctor.name}
                                 </p>
                               )}
                             </div>
                           </div>
                           <div className="flex items-center gap-3">
                             {booking.total_amount && (
                               <span className="font-semibold">
                                 ₹{booking.total_amount}
                               </span>
                             )}
                             <span className={cn(
                               'px-2 py-1 rounded-full text-xs font-medium capitalize',
                               getStatusColor(booking.status)
                             )}>
                               {booking.status.replace('_', ' ')}
                             </span>
                             <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon">
                                   <MoreVertical className="w-4 h-4" />
                                 </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end">
                                 {booking.status === 'pending' && (
                                   <DropdownMenuItem
                                     onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                   >
                                     <CheckCircle className="w-4 h-4 mr-2" />
                                     Confirm
                                   </DropdownMenuItem>
                                 )}
                                 {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                   <>
                                     <DropdownMenuItem
                                       onClick={() => updateBookingStatus(booking.id, 'completed')}
                                     >
                                       <CheckCircle className="w-4 h-4 mr-2" />
                                       Mark Completed
                                     </DropdownMenuItem>
                                     <DropdownMenuItem
                                       onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                       className="text-destructive"
                                     >
                                       <XCircle className="w-4 h-4 mr-2" />
                                       Cancel
                                     </DropdownMenuItem>
                                     <DropdownMenuItem
                                       onClick={() => updateBookingStatus(booking.id, 'no_show')}
                                     >
                                       <User className="w-4 h-4 mr-2" />
                                       No Show
                                     </DropdownMenuItem>
                                   </>
                                 )}
                               </DropdownMenuContent>
                             </DropdownMenu>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   </motion.div>
                 ))}
               </div>
             </div>
           ))}
         </div>
       )}
     </div>
   );
 }