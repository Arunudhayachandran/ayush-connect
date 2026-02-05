 import { useState, useEffect } from 'react';
 import { motion } from 'framer-motion';
 import { Plus, Trash2, Clock, Calendar, Ban } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
 } from '@/components/ui/dialog';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import { Switch } from '@/components/ui/switch';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/hooks/useAuth';
 import { useToast } from '@/hooks/use-toast';
 import { format, addDays } from 'date-fns';
 import { cn } from '@/lib/utils';
 
 interface TimeSlot {
   id: string;
   day_of_week: number;
   start_time: string;
   end_time: string;
   is_active: boolean | null;
   max_bookings: number | null;
 }
 
 interface BlockedDate {
   id: string;
   blocked_date: string;
   reason: string | null;
 }
 
 const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
 
 const defaultSlot = {
   day_of_week: 1,
   start_time: '09:00',
   end_time: '10:00',
   max_bookings: 1,
 };
 
 export default function CenterAvailability() {
   const { user } = useAuth();
   const { toast } = useToast();
   const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
   const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
   const [loading, setLoading] = useState(true);
   const [centerId, setCenterId] = useState<string | null>(null);
   const [slotDialogOpen, setSlotDialogOpen] = useState(false);
   const [blockDialogOpen, setBlockDialogOpen] = useState(false);
   const [slotForm, setSlotForm] = useState(defaultSlot);
   const [blockForm, setBlockForm] = useState({ date: '', reason: '' });
   const [saving, setSaving] = useState(false);
 
   useEffect(() => {
     if (user) {
       fetchData();
     }
   }, [user]);
 
   const fetchData = async () => {
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
 
       setCenterId(center.id);
 
       const [slotsResult, blockedResult] = await Promise.all([
         supabase
           .from('time_slots')
           .select('*')
           .eq('center_id', center.id)
           .order('day_of_week')
           .order('start_time'),
         supabase
           .from('blocked_dates')
           .select('*')
           .eq('center_id', center.id)
           .gte('blocked_date', format(new Date(), 'yyyy-MM-dd'))
           .order('blocked_date'),
       ]);
 
       setTimeSlots(slotsResult.data || []);
       setBlockedDates(blockedResult.data || []);
     } catch (error) {
       console.error('Error fetching data:', error);
     } finally {
       setLoading(false);
     }
   };
 
   const handleAddSlot = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!centerId) return;
 
     setSaving(true);
     try {
       const { error } = await supabase.from('time_slots').insert({
         center_id: centerId,
         day_of_week: slotForm.day_of_week,
         start_time: slotForm.start_time,
         end_time: slotForm.end_time,
         max_bookings: slotForm.max_bookings,
         is_active: true,
       });
 
       if (error) throw error;
       toast({ title: 'Time slot added' });
       setSlotDialogOpen(false);
       setSlotForm(defaultSlot);
       fetchData();
     } catch (error: any) {
       toast({ title: 'Error', description: error.message, variant: 'destructive' });
     } finally {
       setSaving(false);
     }
   };
 
   const handleDeleteSlot = async (slotId: string) => {
     try {
       const { error } = await supabase.from('time_slots').delete().eq('id', slotId);
       if (error) throw error;
       toast({ title: 'Slot deleted' });
       fetchData();
     } catch (error: any) {
       toast({ title: 'Error', description: error.message, variant: 'destructive' });
     }
   };
 
   const toggleSlotActive = async (slot: TimeSlot) => {
     try {
       const { error } = await supabase
         .from('time_slots')
         .update({ is_active: !slot.is_active })
         .eq('id', slot.id);
       if (error) throw error;
       fetchData();
     } catch (error: any) {
       toast({ title: 'Error', description: error.message, variant: 'destructive' });
     }
   };
 
   const handleBlockDate = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!centerId) return;
 
     setSaving(true);
     try {
       const { error } = await supabase.from('blocked_dates').insert({
         center_id: centerId,
         blocked_date: blockForm.date,
         reason: blockForm.reason || null,
       });
 
       if (error) throw error;
       toast({ title: 'Date blocked' });
       setBlockDialogOpen(false);
       setBlockForm({ date: '', reason: '' });
       fetchData();
     } catch (error: any) {
       toast({ title: 'Error', description: error.message, variant: 'destructive' });
     } finally {
       setSaving(false);
     }
   };
 
   const handleUnblockDate = async (id: string) => {
     try {
       const { error } = await supabase.from('blocked_dates').delete().eq('id', id);
       if (error) throw error;
       toast({ title: 'Date unblocked' });
       fetchData();
     } catch (error: any) {
       toast({ title: 'Error', description: error.message, variant: 'destructive' });
     }
   };
 
   const slotsByDay = dayNames.map((day, index) => ({
     day,
     dayIndex: index,
     slots: timeSlots.filter((s) => s.day_of_week === index),
   }));
 
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
         <h1 className="font-display text-2xl font-bold">Availability</h1>
         <p className="text-muted-foreground">Manage your weekly schedule and blocked dates</p>
       </div>
 
       {/* Weekly Schedule */}
       <Card>
         <CardHeader className="flex flex-row items-center justify-between">
           <CardTitle className="text-lg">Weekly Schedule</CardTitle>
           <Dialog open={slotDialogOpen} onOpenChange={setSlotDialogOpen}>
             <DialogTrigger asChild>
               <Button size="sm" className="gap-2">
                 <Plus className="w-4 h-4" />
                 Add Slot
               </Button>
             </DialogTrigger>
             <DialogContent>
               <DialogHeader>
                 <DialogTitle>Add Time Slot</DialogTitle>
               </DialogHeader>
               <form onSubmit={handleAddSlot} className="space-y-4">
                 <div className="space-y-2">
                   <Label>Day of Week</Label>
                   <Select
                     value={slotForm.day_of_week.toString()}
                     onValueChange={(v) => setSlotForm({ ...slotForm, day_of_week: parseInt(v) })}
                   >
                     <SelectTrigger>
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       {dayNames.map((day, i) => (
                         <SelectItem key={i} value={i.toString()}>
                           {day}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>Start Time</Label>
                     <Input
                       type="time"
                       value={slotForm.start_time}
                       onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
                       required
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>End Time</Label>
                     <Input
                       type="time"
                       value={slotForm.end_time}
                       onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
                       required
                     />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <Label>Max Bookings per Slot</Label>
                   <Input
                     type="number"
                     min="1"
                     value={slotForm.max_bookings}
                     onChange={(e) => setSlotForm({ ...slotForm, max_bookings: parseInt(e.target.value) || 1 })}
                   />
                 </div>
                 <div className="flex gap-3 pt-4">
                   <Button type="button" variant="outline" className="flex-1" onClick={() => setSlotDialogOpen(false)}>
                     Cancel
                   </Button>
                   <Button type="submit" className="flex-1" disabled={saving}>
                     {saving ? 'Adding...' : 'Add Slot'}
                   </Button>
                 </div>
               </form>
             </DialogContent>
           </Dialog>
         </CardHeader>
         <CardContent>
           <div className="space-y-4">
             {slotsByDay.map(({ day, dayIndex, slots }) => (
               <div key={dayIndex} className="flex items-start gap-4 py-3 border-b last:border-0">
                 <div className="w-24 font-medium text-sm">{day}</div>
                 <div className="flex-1">
                   {slots.length === 0 ? (
                     <span className="text-sm text-muted-foreground">No slots</span>
                   ) : (
                     <div className="flex flex-wrap gap-2">
                       {slots.map((slot) => (
                         <div
                           key={slot.id}
                           className={cn(
                             'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
                             slot.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                           )}
                         >
                           <Clock className="w-3 h-3" />
                           {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                           <Switch
                             checked={slot.is_active ?? false}
                             onCheckedChange={() => toggleSlotActive(slot)}
                             className="scale-75"
                           />
                           <button
                             onClick={() => handleDeleteSlot(slot.id)}
                             className="text-destructive hover:text-destructive/80"
                           >
                             <Trash2 className="w-3 h-3" />
                           </button>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               </div>
             ))}
           </div>
         </CardContent>
       </Card>
 
       {/* Blocked Dates */}
       <Card>
         <CardHeader className="flex flex-row items-center justify-between">
           <CardTitle className="text-lg">Blocked Dates</CardTitle>
           <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
             <DialogTrigger asChild>
               <Button size="sm" variant="outline" className="gap-2">
                 <Ban className="w-4 h-4" />
                 Block Date
               </Button>
             </DialogTrigger>
             <DialogContent>
               <DialogHeader>
                 <DialogTitle>Block a Date</DialogTitle>
               </DialogHeader>
               <form onSubmit={handleBlockDate} className="space-y-4">
                 <div className="space-y-2">
                   <Label>Date</Label>
                   <Input
                     type="date"
                     value={blockForm.date}
                     min={format(new Date(), 'yyyy-MM-dd')}
                     onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })}
                     required
                   />
                 </div>
                 <div className="space-y-2">
                   <Label>Reason (optional)</Label>
                   <Input
                     value={blockForm.reason}
                     onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                     placeholder="e.g., Holiday, Maintenance"
                   />
                 </div>
                 <div className="flex gap-3 pt-4">
                   <Button type="button" variant="outline" className="flex-1" onClick={() => setBlockDialogOpen(false)}>
                     Cancel
                   </Button>
                   <Button type="submit" className="flex-1" disabled={saving}>
                     {saving ? 'Blocking...' : 'Block Date'}
                   </Button>
                 </div>
               </form>
             </DialogContent>
           </Dialog>
         </CardHeader>
         <CardContent>
           {blockedDates.length === 0 ? (
             <p className="text-sm text-muted-foreground text-center py-4">No blocked dates</p>
           ) : (
             <div className="space-y-2">
               {blockedDates.map((blocked) => (
                 <div
                   key={blocked.id}
                   className="flex items-center justify-between p-3 rounded-lg bg-destructive/5"
                 >
                   <div className="flex items-center gap-3">
                     <Calendar className="w-4 h-4 text-destructive" />
                     <div>
                       <p className="font-medium text-sm">
                         {format(new Date(blocked.blocked_date), 'EEE, MMM dd, yyyy')}
                       </p>
                       {blocked.reason && (
                         <p className="text-xs text-muted-foreground">{blocked.reason}</p>
                       )}
                     </div>
                   </div>
                   <Button
                     size="sm"
                     variant="ghost"
                     onClick={() => handleUnblockDate(blocked.id)}
                     className="text-destructive hover:text-destructive"
                   >
                     <Trash2 className="w-4 h-4" />
                   </Button>
                 </div>
               ))}
             </div>
           )}
         </CardContent>
       </Card>
     </div>
   );
 }