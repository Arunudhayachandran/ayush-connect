 import { useState, useEffect } from 'react';
 import { motion } from 'framer-motion';
 import { Plus, Pencil, Trash2, User, Award, Star } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import { Card, CardContent } from '@/components/ui/card';
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
 
 interface Doctor {
   id: string;
   name: string;
   specialization: AyushServiceType;
   qualification: string | null;
   experience_years: number | null;
   bio: string | null;
   consultation_fee: number | null;
   is_available: boolean | null;
   photo_url: string | null;
 }
 
 const defaultDoctor = {
   name: '',
   specialization: 'ayurveda' as AyushServiceType,
   qualification: '',
   experience_years: 0,
   bio: '',
   consultation_fee: 0,
   is_available: true,
 };
 
 export default function CenterDoctors() {
   const { user } = useAuth();
   const { toast } = useToast();
   const [doctors, setDoctors] = useState<Doctor[]>([]);
   const [loading, setLoading] = useState(true);
   const [centerId, setCenterId] = useState<string | null>(null);
   const [dialogOpen, setDialogOpen] = useState(false);
   const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
   const [formData, setFormData] = useState(defaultDoctor);
   const [saving, setSaving] = useState(false);
 
   useEffect(() => {
     if (user) {
       fetchDoctors();
     }
   }, [user]);
 
   const fetchDoctors = async () => {
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
         .from('doctors')
         .select('*')
         .eq('center_id', center.id)
         .order('name');
 
       if (error) throw error;
       setDoctors(data || []);
     } catch (error) {
       console.error('Error fetching doctors:', error);
     } finally {
       setLoading(false);
     }
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!centerId) return;
 
     setSaving(true);
     try {
       if (editingDoctor) {
         const { error } = await supabase
           .from('doctors')
           .update({
             name: formData.name,
             specialization: formData.specialization,
             qualification: formData.qualification || null,
             experience_years: formData.experience_years,
             bio: formData.bio || null,
             consultation_fee: formData.consultation_fee,
             is_available: formData.is_available,
           })
           .eq('id', editingDoctor.id);
 
         if (error) throw error;
         toast({ title: 'Doctor updated successfully' });
       } else {
         const { error } = await supabase
           .from('doctors')
           .insert({
             center_id: centerId,
             name: formData.name,
             specialization: formData.specialization,
             qualification: formData.qualification || null,
             experience_years: formData.experience_years,
             bio: formData.bio || null,
             consultation_fee: formData.consultation_fee,
             is_available: formData.is_available,
           });
 
         if (error) throw error;
         toast({ title: 'Doctor added successfully' });
       }
 
       setDialogOpen(false);
       setEditingDoctor(null);
       setFormData(defaultDoctor);
       fetchDoctors();
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
 
   const handleDelete = async (doctorId: string) => {
     if (!confirm('Are you sure you want to remove this doctor?')) return;
 
     try {
       const { error } = await supabase
         .from('doctors')
         .delete()
         .eq('id', doctorId);
 
       if (error) throw error;
       toast({ title: 'Doctor removed' });
       fetchDoctors();
     } catch (error: any) {
       toast({
         title: 'Error',
         description: error.message,
         variant: 'destructive',
       });
     }
   };
 
   const openEditDialog = (doctor: Doctor) => {
     setEditingDoctor(doctor);
     setFormData({
       name: doctor.name,
       specialization: doctor.specialization,
       qualification: doctor.qualification || '',
       experience_years: doctor.experience_years || 0,
       bio: doctor.bio || '',
       consultation_fee: doctor.consultation_fee || 0,
       is_available: doctor.is_available ?? true,
     });
     setDialogOpen(true);
   };
 
   const openCreateDialog = () => {
     setEditingDoctor(null);
     setFormData(defaultDoctor);
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
           <h1 className="font-display text-2xl font-bold">Doctors</h1>
           <p className="text-muted-foreground">Manage your center's practitioners</p>
         </div>
         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
           <DialogTrigger asChild>
             <Button onClick={openCreateDialog} className="gap-2">
               <Plus className="w-4 h-4" />
               Add Doctor
             </Button>
           </DialogTrigger>
           <DialogContent className="max-w-lg">
             <DialogHeader>
               <DialogTitle>
                 {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
               </DialogTitle>
             </DialogHeader>
             <form onSubmit={handleSubmit} className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="name">Full Name</Label>
                 <Input
                   id="name"
                   value={formData.name}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                   placeholder="Dr. Name"
                   required
                 />
               </div>
 
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="specialization">Specialization</Label>
                   <Select
                     value={formData.specialization}
                     onValueChange={(value) => setFormData({ ...formData, specialization: value as AyushServiceType })}
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
                   <Label htmlFor="experience">Experience (years)</Label>
                   <Input
                     id="experience"
                     type="number"
                     min="0"
                     value={formData.experience_years}
                     onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                   />
                 </div>
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="qualification">Qualification</Label>
                 <Input
                   id="qualification"
                   value={formData.qualification}
                   onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                   placeholder="e.g., BAMS, MD (Ayurveda)"
                 />
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="fee">Consultation Fee (₹)</Label>
                 <Input
                   id="fee"
                   type="number"
                   min="0"
                   value={formData.consultation_fee}
                   onChange={(e) => setFormData({ ...formData, consultation_fee: parseInt(e.target.value) || 0 })}
                 />
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="bio">Bio</Label>
                 <Textarea
                   id="bio"
                   value={formData.bio}
                   onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                   placeholder="Brief introduction..."
                   rows={3}
                 />
               </div>
 
               <div className="flex items-center justify-between">
                 <Label htmlFor="is_available">Available for appointments</Label>
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
                   {saving ? 'Saving...' : editingDoctor ? 'Update' : 'Add'}
                 </Button>
               </div>
             </form>
           </DialogContent>
         </Dialog>
       </div>
 
       {/* Doctors Grid */}
       {doctors.length === 0 ? (
         <Card>
           <CardContent className="py-12 text-center">
             <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
             <p className="text-muted-foreground mb-4">No doctors added yet</p>
             <Button onClick={openCreateDialog} className="gap-2">
               <Plus className="w-4 h-4" />
               Add Your First Doctor
             </Button>
           </CardContent>
         </Card>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {doctors.map((doctor, index) => (
             <motion.div
               key={doctor.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.05 }}
             >
               <Card className={!doctor.is_available ? 'opacity-60' : ''}>
                 <CardContent className="p-5">
                   <div className="flex items-center gap-4 mb-4">
                     <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
                       👨‍⚕️
                     </div>
                     <div className="flex-1 min-w-0">
                       <h3 className="font-semibold truncate">{doctor.name}</h3>
                       <ServiceBadge serviceType={doctor.specialization} size="sm" className="mt-1" />
                     </div>
                   </div>
                   
                   {doctor.qualification && (
                     <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                       <Award className="w-4 h-4" />
                       {doctor.qualification}
                     </div>
                   )}
                   
                   <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                     {doctor.experience_years && (
                       <span>{doctor.experience_years} yrs exp</span>
                     )}
                     {doctor.consultation_fee && (
                       <span>₹{doctor.consultation_fee}</span>
                     )}
                   </div>
 
                   {!doctor.is_available && (
                     <span className="inline-block text-xs bg-muted px-2 py-1 rounded-full mb-3">
                       Unavailable
                     </span>
                   )}
 
                   <div className="flex gap-2">
                     <Button
                       variant="outline"
                       size="sm"
                       className="flex-1 gap-1"
                       onClick={() => openEditDialog(doctor)}
                     >
                       <Pencil className="w-3 h-3" />
                       Edit
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       className="text-destructive hover:text-destructive"
                       onClick={() => handleDelete(doctor.id)}
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