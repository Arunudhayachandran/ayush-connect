import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Building2, Search, CheckCircle, XCircle, Clock, MapPin,
  Star, Phone, Mail, Eye, MoreVertical, Shield, Ban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ServiceBadge } from '@/components/ui/ServiceBadge';
import type { AyushServiceType } from '@/lib/constants';

type FilterStatus = 'all' | 'verified' | 'pending' | 'inactive';

interface Center {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string | null;
  email: string | null;
  is_verified: boolean | null;
  is_active: boolean | null;
  average_rating: number | null;
  total_bookings: number | null;
  service_types: AyushServiceType[];
  created_at: string;
}

export default function AdminCenters() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [actionDialog, setActionDialog] = useState<{ type: 'verify' | 'suspend' | 'delete'; center: Center } | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: centers, isLoading } = useQuery({
    queryKey: ['admin-centers', filterStatus, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('centers')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus === 'verified') {
        query = query.eq('is_verified', true);
      } else if (filterStatus === 'pending') {
        query = query.eq('is_verified', false);
      } else if (filterStatus === 'inactive') {
        query = query.eq('is_active', false);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Center[];
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (centerId: string) => {
      const { error } = await supabase
        .from('centers')
        .update({ is_verified: true })
        .eq('id', centerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-centers'] });
      toast({ title: 'Center verified successfully' });
      setActionDialog(null);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async (centerId: string) => {
      const { error } = await supabase
        .from('centers')
        .update({ is_active: false })
        .eq('id', centerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-centers'] });
      toast({ title: 'Center suspended' });
      setActionDialog(null);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (centerId: string) => {
      const { error } = await supabase
        .from('centers')
        .update({ is_active: true })
        .eq('id', centerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-centers'] });
      toast({ title: 'Center activated' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const getStatusBadge = (center: Center) => {
    if (!center.is_active) {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    if (center.is_verified) {
      return <Badge className="bg-primary">Verified</Badge>;
    }
    return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">Pending</Badge>;
  };

  const filterButtons: { value: FilterStatus; label: string; count?: number }[] = [
    { value: 'all', label: 'All Centers' },
    { value: 'pending', label: 'Pending' },
    { value: 'verified', label: 'Verified' },
    { value: 'inactive', label: 'Suspended' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Center Management</h1>
        <p className="text-muted-foreground">Verify and manage wellness centers</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search centers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {filterButtons.map((btn) => (
            <Button
              key={btn.value}
              variant={filterStatus === btn.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(btn.value)}
              className="whitespace-nowrap"
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Centers List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-48 mb-2" />
              <div className="h-3 bg-muted rounded w-32" />
            </div>
          ))}
        </div>
      ) : centers?.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No centers found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {centers?.map((center, index) => (
            <motion.div
              key={center.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg truncate">{center.name}</h3>
                    {getStatusBadge(center)}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {center.city}, {center.state}
                    </span>
                    {center.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {center.phone}
                      </span>
                    )}
                    {center.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {center.email}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {center.service_types?.map((type) => (
                      <ServiceBadge key={type} serviceType={type} size="sm" />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-secondary fill-secondary" />
                      <span className="font-medium">{center.average_rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {center.total_bookings || 0} bookings
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedCenter(center)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {!center.is_verified && center.is_active && (
                        <DropdownMenuItem onClick={() => setActionDialog({ type: 'verify', center })}>
                          <Shield className="w-4 h-4 mr-2" />
                          Verify Center
                        </DropdownMenuItem>
                      )}
                      {center.is_active ? (
                        <DropdownMenuItem
                          onClick={() => setActionDialog({ type: 'suspend', center })}
                          className="text-destructive"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Suspend
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => activateMutation.mutate(center.id)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Activate
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={!!selectedCenter} onOpenChange={() => setSelectedCenter(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCenter?.name}</DialogTitle>
            <DialogDescription>Center details and information</DialogDescription>
          </DialogHeader>
          {selectedCenter && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{selectedCenter.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">City</p>
                  <p className="font-medium">{selectedCenter.city}, {selectedCenter.state}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedCenter.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedCenter.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="font-medium">{selectedCenter.average_rating?.toFixed(1) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="font-medium">{selectedCenter.total_bookings || 0}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Services</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCenter.service_types?.map((type) => (
                    <ServiceBadge key={type} serviceType={type} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.type === 'verify' && 'Verify Center'}
              {actionDialog?.type === 'suspend' && 'Suspend Center'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog?.type === 'verify' && 
                `Are you sure you want to verify "${actionDialog.center.name}"? This will mark the center as officially verified.`
              }
              {actionDialog?.type === 'suspend' && 
                `Are you sure you want to suspend "${actionDialog?.center.name}"? This will temporarily disable the center.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            <Button
              variant={actionDialog?.type === 'suspend' ? 'destructive' : 'default'}
              onClick={() => {
                if (actionDialog?.type === 'verify') {
                  verifyMutation.mutate(actionDialog.center.id);
                } else if (actionDialog?.type === 'suspend') {
                  suspendMutation.mutate(actionDialog.center.id);
                }
              }}
            >
              {actionDialog?.type === 'verify' && 'Verify'}
              {actionDialog?.type === 'suspend' && 'Suspend'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
