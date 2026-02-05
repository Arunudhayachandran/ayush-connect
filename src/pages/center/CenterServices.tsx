 import { useState, useEffect } from 'react';
 import { motion } from 'framer-motion';
 import { Plus, Pencil, Trash2, Clock, DollarSign } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
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
 import { ServiceBadge } from '@/components/ui/ServiceBadge';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/hooks/useAuth';
 import { useToast } from '@/hooks/use-toast';
 import { AYUSH_SERVICES, type AyushServiceType } from '@/lib/constants';
 
 interface Service {
   id: string;
   name: string;
   description: string | null;
   price: number;
   duration_minutes: number | null;
   service_type: AyushServiceType;
   is_available: boolean | null;
 }
 
 const defaultService = {
   name: '',
   description: '',
   price: 0,
   duration_minutes: 30,
   service_type: 'ayurveda' as AyushServiceType,
   is_available: true,
 };
 
 export default function CenterServices() {
   const { user } = useAuth();
   const { toast } = useToast();
   const [services, setServices] = useState<Service[]>([]);
   const [loading, setLoading] = useState(true);
   const [centerId, setCenterId] = useState<string | null>(null);
   const [dialogOpen, setDialogOpen] = useState(false);
   const [editingService, setEditingService] = useState<Service | null>(null);
   const [formData, setFormData] = useState(defaultService);
   const [saving, setSaving] = useState(false);
 
   useEffect(() => {
     if (user) {
       fetchServices();
     }
   }, [user]);
 
   const fetchServices = async () => {
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
 
       const { data, error } = await supabase
         .from('services')
         .select('*')
         .eq('center_id', center.id)
         .order('name');
 
       if (error) throw error;
       setServices(data || []);
     } catch (error) {
       console.error('Error fetching services:', error);
     } finally {
       setLoading(false);
     }
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!centerId) return;
 
     setSaving(true);
     try {
       if (editingService) {
         const { error } = await supabase
           .from('services')
           .update({
             name: formData.name,
             description: formData.description || null,
             price: formData.price,
             duration_minutes: formData.duration_minutes,
             service_type: formData.service_type,
             is_available: formData.is_available,
           })
           .eq('id', editingService.id);
 
         if (error) throw error;
         toast({ title: 'Service updated successfully' });
       } else {
         const { error } = await supabase
           .from('services')
           .insert({
             center_id: centerId,
             name: formData.name,
             description: formData.description || null,
             price: formData.price,
             duration_minutes: formData.duration_minutes,
             service_type: formData.service_type,
             is_available: formData.is_available,
           });
 
         if (error) throw error;
         toast({ title: 'Service created successfully' });
       }
 
       setDialogOpen(false);
       setEditingService(null);
       setFormData(defaultService);
       fetchServices();
     } catch (error: any) {
       toast({
         title: 'Error',
         description: error.message,
         variant: 'destructive',
       });
     } finally {
       setSaving(false);
     }
   };
 
   const handleDelete = async (serviceId: string) => {
     if (!confirm('Are you sure you want to delete this service?')) return;
 
     try {
       const { error } = await supabase
         .from('services')
         .delete()
         .eq('id', serviceId);
 
       if (error) throw error;
       toast({ title: 'Service deleted' });
       fetchServices();
     } catch (error: any) {
       toast({
         title: 'Error',
         description: error.message,
         variant: 'destructive',
       });
     }
   };
 
   const openEditDialog = (service: Service) => {
     setEditingService(service);
     setFormData({
       name: service.name,
       description: service.description || '',
       price: service.price,
       duration_minutes: service.duration_minutes || 30,
       service_type: service.service_type,
       is_available: service.is_available ?? true,
     });
     setDialogOpen(true);
   };
 
   const openCreateDialog = () => {
     setEditingService(null);
     setFormData(defaultService);
     setDialogOpen(true);
   };
 
   if (loading) {
     return (
       <div className="flex items-center justify-center h-64">
         <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="font-display text-2xl font-bold">Services</h1>
           <p className="text-muted-foreground">Manage your center's services and pricing</p>
         </div>
         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
           <DialogTrigger asChild>
             <Button onClick={openCreateDialog} className="gap-2">
               <Plus className="w-4 h-4" />
               Add Service
             </Button>
           </DialogTrigger>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>
                 {editingService ? 'Edit Service' : 'Add New Service'}
               </DialogTitle>
             </DialogHeader>
             <form onSubmit={handleSubmit} className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="name">Service Name</Label>
                 <Input
                   id="name"
                   value={formData.name}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                   placeholder="e.g., Ayurvedic Consultation"
                   required
                 />
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="service_type">Service Type</Label>
                 <Select
                   value={formData.service_type}
                   onValueChange={(value) => setFormData({ ...formData, service_type: value as AyushServiceType })}
                 >
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     {AYUSH_SERVICES.map((service) => (
                       <SelectItem key={service.id} value={service.id}>
                         {service.icon} {service.name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="description">Description</Label>
                 <Textarea
                   id="description"
                   value={formData.description}
                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                   placeholder="Describe the service..."
                   rows={3}
                 />
               </div>
 
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="price">Price (₹)</Label>
                   <Input
                     id="price"
                     type="number"
                     min="0"
                     value={formData.price}
                     onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                     required
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="duration">Duration (min)</Label>
                   <Input
                     id="duration"
                     type="number"
                     min="5"
                     step="5"
                     value={formData.duration_minutes}
                     onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 30 })}
                     required
                   />
                 </div>
               </div>
 
               <div className="flex items-center justify-between">
                 <Label htmlFor="is_available">Available for booking</Label>
                 <Switch
                   id="is_available"
                   checked={formData.is_available}
                   onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                 />
               </div>
 
               <div className="flex gap-3 pt-4">
                 <Button
                   type="button"
                   variant="outline"
                   className="flex-1"
                   onClick={() => setDialogOpen(false)}
                 >
                   Cancel
                 </Button>
                 <Button type="submit" className="flex-1" disabled={saving}>
                   {saving ? 'Saving...' : editingService ? 'Update' : 'Create'}
                 </Button>
               </div>
             </form>
           </DialogContent>
         </Dialog>
       </div>
 
       {/* Services Grid */}
       {services.length === 0 ? (
         <Card>
           <CardContent className="py-12 text-center">
             <p className="text-muted-foreground mb-4">No services added yet</p>
             <Button onClick={openCreateDialog} className="gap-2">
               <Plus className="w-4 h-4" />
               Add Your First Service
             </Button>
           </CardContent>
         </Card>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {services.map((service, index) => (
             <motion.div
               key={service.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.05 }}
             >
               <Card className={!service.is_available ? 'opacity-60' : ''}>
                 <CardContent className="p-5">
                   <div className="flex items-start justify-between mb-3">
                     <ServiceBadge serviceType={service.service_type} size="sm" />
                     {!service.is_available && (
                       <span className="text-xs bg-muted px-2 py-1 rounded-full">
                         Unavailable
                       </span>
                     )}
                   </div>
                   <h3 className="font-semibold mb-1">{service.name}</h3>
                   {service.description && (
                     <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                       {service.description}
                     </p>
                   )}
                   <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                     <span className="flex items-center gap-1">
                       <Clock className="w-4 h-4" />
                       {service.duration_minutes} min
                     </span>
                     <span className="flex items-center gap-1">
                       <DollarSign className="w-4 h-4" />
                       ₹{service.price}
                     </span>
                   </div>
                   <div className="flex gap-2">
                     <Button
                       variant="outline"
                       size="sm"
                       className="flex-1 gap-1"
                       onClick={() => openEditDialog(service)}
                     >
                       <Pencil className="w-3 h-3" />
                       Edit
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       className="text-destructive hover:text-destructive"
                       onClick={() => handleDelete(service.id)}
                     >
                       <Trash2 className="w-3 h-3" />
                     </Button>
                   </div>
                 </CardContent>
               </Card>
             </motion.div>
           ))}
         </div>
       )}
     </div>
   );
 }