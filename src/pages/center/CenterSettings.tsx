 import { useState, useEffect } from 'react';
 import { motion } from 'framer-motion';
 import { Save, MapPin, Clock, Phone, Globe, Mail } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { Switch } from '@/components/ui/switch';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/hooks/useAuth';
 import { useToast } from '@/hooks/use-toast';
 import { AYUSH_SERVICES, type AyushServiceType } from '@/lib/constants';
 import { cn } from '@/lib/utils';
 
 interface CenterData {
   id: string;
   name: string;
   description: string | null;
   address: string;
   city: string;
   state: string;
   pincode: string | null;
   phone: string | null;
   email: string | null;
   website: string | null;
   opening_time: string | null;
   closing_time: string | null;
   working_days: number[] | null;
   service_types: AyushServiceType[];
   cancellation_hours: number | null;
   is_active: boolean | null;
 }
 
 const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
 
 export default function CenterSettings() {
   const { user } = useAuth();
   const { toast } = useToast();
   const [center, setCenter] = useState<CenterData | null>(null);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
 
   useEffect(() => {
     if (user) {
       fetchCenter();
     }
   }, [user]);
 
   const fetchCenter = async () => {
     try {
       const { data, error } = await supabase
         .from('centers')
         .select('*')
         .eq('owner_id', user?.id)
         .maybeSingle();
 
       if (error) throw error;
       setCenter(data);
     } catch (error) {
       console.error('Error fetching center:', error);
     } finally {
       setLoading(false);
     }
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!center) return;
 
     setSaving(true);
     try {
       const { error } = await supabase
         .from('centers')
         .update({
           name: center.name,
           description: center.description,
           address: center.address,
           city: center.city,
           state: center.state,
           pincode: center.pincode,
           phone: center.phone,
           email: center.email,
           website: center.website,
           opening_time: center.opening_time,
           closing_time: center.closing_time,
           working_days: center.working_days,
           service_types: center.service_types,
           cancellation_hours: center.cancellation_hours,
           is_active: center.is_active,
         })
         .eq('id', center.id);
 
       if (error) throw error;
       toast({ title: 'Settings saved successfully' });
     } catch (error: any) {
       toast({ title: 'Error', description: error.message, variant: 'destructive' });
     } finally {
       setSaving(false);
     }
   };
 
   const toggleWorkingDay = (dayIndex: number) => {
     if (!center) return;
     const days = center.working_days || [];
     const newDays = days.includes(dayIndex)
       ? days.filter((d) => d !== dayIndex)
       : [...days, dayIndex].sort();
     setCenter({ ...center, working_days: newDays });
   };
 
   const toggleServiceType = (serviceType: AyushServiceType) => {
     if (!center) return;
     const types = center.service_types || [];
     const newTypes = types.includes(serviceType)
       ? types.filter((t) => t !== serviceType)
       : [...types, serviceType];
     setCenter({ ...center, service_types: newTypes });
   };
 
   if (loading) {
     return (
       <div className="flex items-center justify-center h-64">
         <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
       </div>
     );
   }
 
   if (!center) {
     return (
       <div className="text-center py-12">
         <h2 className="text-2xl font-bold mb-4">No Center Found</h2>
         <p className="text-muted-foreground">Create a center to manage settings.</p>
       </div>
     );
   }
 
   return (
     <div className="space-y-6 max-w-3xl">
       <div>
         <h1 className="font-display text-2xl font-bold">Center Settings</h1>
         <p className="text-muted-foreground">Manage your center profile and preferences</p>
       </div>
 
       <form onSubmit={handleSubmit} className="space-y-6">
         {/* Basic Info */}
         <Card>
           <CardHeader>
             <CardTitle className="text-lg">Basic Information</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="name">Center Name</Label>
               <Input
                 id="name"
                 value={center.name}
                 onChange={(e) => setCenter({ ...center, name: e.target.value })}
                 required
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="description">Description</Label>
               <Textarea
                 id="description"
                 value={center.description || ''}
                 onChange={(e) => setCenter({ ...center, description: e.target.value })}
                 rows={4}
               />
             </div>
             <div className="flex items-center justify-between">
               <div>
                 <Label>Center Active</Label>
                 <p className="text-sm text-muted-foreground">
                   When disabled, your center won't appear in search results
                 </p>
               </div>
               <Switch
                 checked={center.is_active ?? true}
                 onCheckedChange={(checked) => setCenter({ ...center, is_active: checked })}
               />
             </div>
           </CardContent>
         </Card>
 
         {/* Location */}
         <Card>
           <CardHeader>
             <CardTitle className="text-lg">Location</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="address">Address</Label>
               <Input
                 id="address"
                 value={center.address}
                 onChange={(e) => setCenter({ ...center, address: e.target.value })}
                 required
               />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="city">City</Label>
                 <Input
                   id="city"
                   value={center.city}
                   onChange={(e) => setCenter({ ...center, city: e.target.value })}
                   required
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="state">State</Label>
                 <Input
                   id="state"
                   value={center.state}
                   onChange={(e) => setCenter({ ...center, state: e.target.value })}
                   required
                 />
               </div>
             </div>
             <div className="space-y-2">
               <Label htmlFor="pincode">Pincode</Label>
               <Input
                 id="pincode"
                 value={center.pincode || ''}
                 onChange={(e) => setCenter({ ...center, pincode: e.target.value })}
               />
             </div>
           </CardContent>
         </Card>
 
         {/* Contact */}
         <Card>
           <CardHeader>
             <CardTitle className="text-lg">Contact Information</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="phone">Phone</Label>
                 <Input
                   id="phone"
                   type="tel"
                   value={center.phone || ''}
                   onChange={(e) => setCenter({ ...center, phone: e.target.value })}
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="email">Email</Label>
                 <Input
                   id="email"
                   type="email"
                   value={center.email || ''}
                   onChange={(e) => setCenter({ ...center, email: e.target.value })}
                 />
               </div>
             </div>
             <div className="space-y-2">
               <Label htmlFor="website">Website</Label>
               <Input
                 id="website"
                 value={center.website || ''}
                 onChange={(e) => setCenter({ ...center, website: e.target.value })}
                 placeholder="www.example.com"
               />
             </div>
           </CardContent>
         </Card>
 
         {/* Service Types */}
         <Card>
           <CardHeader>
             <CardTitle className="text-lg">Service Types</CardTitle>
             <CardDescription>Select the types of AYUSH services you offer</CardDescription>
           </CardHeader>
           <CardContent>
             <div className="flex flex-wrap gap-2">
               {AYUSH_SERVICES.map((service) => (
                 <button
                   key={service.id}
                   type="button"
                   onClick={() => toggleServiceType(service.id)}
                   className={cn(
                     'px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                     center.service_types?.includes(service.id)
                       ? 'bg-primary text-primary-foreground border-primary'
                       : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
                   )}
                 >
                   {service.icon} {service.name}
                 </button>
               ))}
             </div>
           </CardContent>
         </Card>
 
         {/* Working Hours */}
         <Card>
           <CardHeader>
             <CardTitle className="text-lg">Working Hours</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="opening">Opening Time</Label>
                 <Input
                   id="opening"
                   type="time"
                   value={center.opening_time || '09:00'}
                   onChange={(e) => setCenter({ ...center, opening_time: e.target.value })}
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="closing">Closing Time</Label>
                 <Input
                   id="closing"
                   type="time"
                   value={center.closing_time || '18:00'}
                   onChange={(e) => setCenter({ ...center, closing_time: e.target.value })}
                 />
               </div>
             </div>
             <div className="space-y-2">
               <Label>Working Days</Label>
               <div className="flex gap-2">
                 {dayNames.map((day, index) => (
                   <button
                     key={day}
                     type="button"
                     onClick={() => toggleWorkingDay(index)}
                     className={cn(
                       'w-10 h-10 rounded-full text-xs font-medium transition-all',
                       center.working_days?.includes(index)
                         ? 'bg-primary text-primary-foreground'
                         : 'bg-muted text-muted-foreground hover:bg-muted/80'
                     )}
                   >
                     {day}
                   </button>
                 ))}
               </div>
             </div>
           </CardContent>
         </Card>
 
         {/* Policies */}
         <Card>
           <CardHeader>
             <CardTitle className="text-lg">Booking Policies</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="space-y-2">
               <Label htmlFor="cancellation">Free Cancellation Window (hours)</Label>
               <Input
                 id="cancellation"
                 type="number"
                 min="0"
                 value={center.cancellation_hours || 24}
                 onChange={(e) => setCenter({ ...center, cancellation_hours: parseInt(e.target.value) || 24 })}
               />
               <p className="text-sm text-muted-foreground">
                 Patients can cancel for free up to {center.cancellation_hours || 24} hours before the appointment
               </p>
             </div>
           </CardContent>
         </Card>
 
         <Button type="submit" className="w-full gap-2" disabled={saving}>
           <Save className="w-4 h-4" />
           {saving ? 'Saving...' : 'Save Settings'}
         </Button>
       </form>
     </div>
   );
 }