import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AyushServiceType } from '@/lib/constants';

export interface Center {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  location_lat: number;
  location_lng: number;
  service_types: AyushServiceType[];
  opening_time: string | null;
  closing_time: string | null;
  working_days: number[] | null;
  is_verified: boolean | null;
  is_active: boolean | null;
  average_rating: number | null;
  total_reviews: number | null;
  total_bookings: number | null;
  photos: string[] | null;
}

export interface CenterWithDistance extends Center {
  distance?: number;
  isOpen?: boolean;
  availableToday?: boolean;
}

interface UseCentersOptions {
  serviceTypes?: AyushServiceType[];
  city?: string;
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Check if center is currently open
function isCurrentlyOpen(openingTime: string | null, closingTime: string | null, workingDays: number[] | null): boolean {
  if (!openingTime || !closingTime) return false;
  
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  if (workingDays && !workingDays.includes(currentDay)) return false;
  
  const [openHour, openMin] = openingTime.split(':').map(Number);
  const [closeHour, closeMin] = closingTime.split(':').map(Number);
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;
  
  return currentTime >= openMinutes && currentTime < closeMinutes;
}

export function useCenters(options: UseCentersOptions = {}) {
  const { serviceTypes, city, searchQuery, userLat, userLng, maxDistance } = options;

  return useQuery({
    queryKey: ['centers', serviceTypes, city, searchQuery],
    queryFn: async (): Promise<CenterWithDistance[]> => {
      let query = supabase
        .from('centers')
        .select('*')
        .eq('is_active', true);

      if (city) {
        query = query.ilike('city', `%${city}%`);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.order('average_rating', { ascending: false });

      if (error) {
        console.error('Error fetching centers:', error);
        throw error;
      }

      let centers: CenterWithDistance[] = (data || []).map((center) => ({
        ...center,
        isOpen: isCurrentlyOpen(center.opening_time, center.closing_time, center.working_days),
        availableToday: center.working_days?.includes(new Date().getDay()) ?? true,
        distance: userLat && userLng 
          ? calculateDistance(userLat, userLng, center.location_lat, center.location_lng)
          : undefined,
      }));

      // Filter by service types
      if (serviceTypes && serviceTypes.length > 0) {
        centers = centers.filter((c) => 
          serviceTypes.some((type) => c.service_types?.includes(type))
        );
      }

      // Filter by distance
      if (maxDistance && userLat && userLng) {
        centers = centers.filter((c) => (c.distance || 0) <= maxDistance);
      }

      // Sort by distance if user location is available
      if (userLat && userLng) {
        centers.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }

      return centers;
    },
  });
}

export function useCenter(centerId: string) {
  return useQuery({
    queryKey: ['center', centerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('centers')
        .select('*')
        .eq('id', centerId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Center not found');

      return {
        ...data,
        isOpen: isCurrentlyOpen(data.opening_time, data.closing_time, data.working_days),
      } as CenterWithDistance;
    },
    enabled: !!centerId,
  });
}

export function useCenterServices(centerId: string) {
  return useQuery({
    queryKey: ['center-services', centerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('center_id', centerId)
        .eq('is_available', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!centerId,
  });
}

export function useCenterDoctors(centerId: string) {
  return useQuery({
    queryKey: ['center-doctors', centerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('center_id', centerId)
        .eq('is_available', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!centerId,
  });
}

export function useCenterReviews(centerId: string) {
  return useQuery({
    queryKey: ['center-reviews', centerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(full_name, avatar_url)')
        .eq('center_id', centerId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    enabled: !!centerId,
  });
}
