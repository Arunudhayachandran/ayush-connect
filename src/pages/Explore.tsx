import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, MapPin, Filter, X, Map, List, Star, Clock, 
  ChevronDown, CheckCircle, Heart, ArrowRight, Navigation,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ServiceBadge } from "@/components/ui/ServiceBadge";
import { RatingStars } from "@/components/ui/RatingStars";
import { AYUSH_SERVICES, DISTANCE_OPTIONS, type AyushServiceType } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useCenters, type CenterWithDistance } from "@/hooks/useCenters";

// Demo data for when database is empty
const demoData: CenterWithDistance[] = [
  {
    id: "demo-1",
    name: "Ayurveda Wellness Center",
    description: "Premier Ayurvedic healthcare with authentic treatments",
    address: "MG Road, Indiranagar",
    city: "Bangalore",
    state: "Karnataka",
    phone: "+91 80 1234 5678",
    email: "info@ayurveda.in",
    website: "www.ayurveda.in",
    location_lat: 12.9716,
    location_lng: 77.5946,
    service_types: ["ayurveda", "yoga"] as AyushServiceType[],
    opening_time: "09:00",
    closing_time: "18:00",
    working_days: [1, 2, 3, 4, 5, 6],
    is_verified: true,
    is_active: true,
    average_rating: 4.8,
    total_reviews: 156,
    total_bookings: 2340,
    photos: null,
    distance: 2.5,
    isOpen: true,
    availableToday: true,
  },
  {
    id: "demo-2",
    name: "Holistic Health Hub",
    description: "Comprehensive naturopathy and yoga therapy",
    address: "Koramangala 4th Block",
    city: "Bangalore",
    state: "Karnataka",
    phone: "+91 80 2345 6789",
    email: "hello@holistic.in",
    website: "www.holistic.in",
    location_lat: 12.9352,
    location_lng: 77.6245,
    service_types: ["naturopathy", "yoga", "ayurveda"] as AyushServiceType[],
    opening_time: "08:00",
    closing_time: "20:00",
    working_days: [0, 1, 2, 3, 4, 5, 6],
    is_verified: true,
    is_active: true,
    average_rating: 4.6,
    total_reviews: 89,
    total_bookings: 1567,
    photos: null,
    distance: 4.2,
    isOpen: true,
    availableToday: true,
  },
  {
    id: "demo-3",
    name: "Dr. Sharma's Homeopathy Clinic",
    description: "Effective homeopathic treatments since 1995",
    address: "Jayanagar 9th Block",
    city: "Bangalore",
    state: "Karnataka",
    phone: "+91 80 3456 7890",
    email: "dr@sharma.in",
    website: "www.drsharma.in",
    location_lat: 12.9279,
    location_lng: 77.5937,
    service_types: ["homeopathy"] as AyushServiceType[],
    opening_time: "10:00",
    closing_time: "17:00",
    working_days: [1, 2, 3, 4, 5],
    is_verified: true,
    is_active: true,
    average_rating: 4.9,
    total_reviews: 234,
    total_bookings: 3200,
    photos: null,
    distance: 5.8,
    isOpen: false,
    availableToday: false,
  },
  {
    id: "demo-4",
    name: "Siddha Traditional Medicine",
    description: "Authentic Siddha treatments by traditional healers",
    address: "BTM Layout",
    city: "Bangalore",
    state: "Karnataka",
    phone: "+91 80 4567 8901",
    email: "contact@siddha.in",
    website: "www.siddha.in",
    location_lat: 12.9166,
    location_lng: 77.6101,
    service_types: ["siddha", "ayurveda"] as AyushServiceType[],
    opening_time: "09:30",
    closing_time: "18:30",
    working_days: [1, 2, 3, 4, 5, 6],
    is_verified: true,
    is_active: true,
    average_rating: 4.5,
    total_reviews: 67,
    total_bookings: 890,
    photos: null,
    distance: 7.1,
    isOpen: true,
    availableToday: true,
  },
  {
    id: "demo-5",
    name: "Unani Wellness Clinic",
    description: "Traditional Unani medicine for holistic healing",
    address: "Whitefield",
    city: "Bangalore",
    state: "Karnataka",
    phone: "+91 80 5678 9012",
    email: "info@unani.in",
    website: "www.unani.in",
    location_lat: 12.9698,
    location_lng: 77.7500,
    service_types: ["unani"] as AyushServiceType[],
    opening_time: "10:00",
    closing_time: "19:00",
    working_days: [1, 2, 3, 4, 5],
    is_verified: true,
    is_active: true,
    average_rating: 4.4,
    total_reviews: 45,
    total_bookings: 560,
    photos: null,
    distance: 12.3,
    isOpen: true,
    availableToday: false,
  },
  {
    id: "demo-6",
    name: "Yoga & Meditation Ashram",
    description: "Find inner peace with daily yoga and meditation",
    address: "Yelahanka",
    city: "Bangalore",
    state: "Karnataka",
    phone: "+91 80 6789 0123",
    email: "namaste@yogaashram.in",
    website: "www.yogaashram.in",
    location_lat: 13.1007,
    location_lng: 77.5963,
    service_types: ["yoga", "naturopathy"] as AyushServiceType[],
    opening_time: "05:00",
    closing_time: "21:00",
    working_days: [0, 1, 2, 3, 4, 5, 6],
    is_verified: true,
    is_active: true,
    average_rating: 4.7,
    total_reviews: 198,
    total_bookings: 2100,
    photos: null,
    distance: 15.6,
    isOpen: true,
    availableToday: true,
  },
];

const serviceEmojis: Record<string, string> = {
  ayurveda: "🌿",
  yoga: "🧘",
  naturopathy: "🍃",
  unani: "⚗️",
  siddha: "🔮",
  homeopathy: "💊",
};

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedServices, setSelectedServices] = useState<AyushServiceType[]>([]);
  const [selectedDistance, setSelectedDistance] = useState("25");
  const [showAvailableToday, setShowAvailableToday] = useState(false);
  const [showOpenNow, setShowOpenNow] = useState(false);

  // Fetch centers from database
  const { data: dbCenters, isLoading } = useCenters({
    searchQuery,
    serviceTypes: selectedServices.length > 0 ? selectedServices : undefined,
  });

  // Use demo data if database is empty
  const centers = dbCenters && dbCenters.length > 0 ? dbCenters : demoData;

  const toggleService = (serviceId: AyushServiceType) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((s) => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  const filteredCenters = centers.filter((center) => {
    if (selectedServices.length > 0 && !selectedServices.some((s) => center.service_types?.includes(s))) {
      return false;
    }
    if (showAvailableToday && !center.availableToday) return false;
    if (showOpenNow && !center.isOpen) return false;
    if (center.distance && center.distance > parseFloat(selectedDistance)) return false;
    if (searchQuery && !center.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const clearFilters = () => {
    setSelectedServices([]);
    setSelectedDistance("25");
    setShowAvailableToday(false);
    setShowOpenNow(false);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedServices.length > 0 || showAvailableToday || showOpenNow || selectedDistance !== "25";

  const getServiceEmoji = (types: AyushServiceType[]) => {
    if (!types || types.length === 0) return "🏥";
    return serviceEmojis[types[0]] || "🏥";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Search Header */}
        <div className="bg-muted/30 border-b border-border py-6">
          <div className="container px-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search centers, services, doctors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-background"
                />
              </div>

              {/* Location */}
              <div className="relative w-full md:w-64">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Your location"
                  defaultValue="Bangalore"
                  className="pl-12 h-12 bg-background"
                />
              </div>

              {/* Filter & View Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={showFilters ? "default" : "outline"}
                  className="h-12 gap-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center">
                      !
                    </span>
                  )}
                </Button>
                <div className="flex rounded-lg border border-input overflow-hidden">
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "h-12 px-4 flex items-center gap-2 transition-colors",
                      viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                    )}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("map")}
                    className={cn(
                      "h-12 px-4 flex items-center gap-2 transition-colors",
                      viewMode === "map" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                    )}
                  >
                    <Map className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-border"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Service Types */}
                  <div>
                    <h4 className="font-medium mb-3 text-sm">Service Type</h4>
                    <div className="flex flex-wrap gap-2">
                      {AYUSH_SERVICES.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => toggleService(service.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                            selectedServices.includes(service.id)
                              ? `badge-${service.id} border-current`
                              : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                          )}
                        >
                          {service.icon} {service.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Distance */}
                  <div>
                    <h4 className="font-medium mb-3 text-sm">Distance</h4>
                    <div className="flex flex-wrap gap-2">
                      {DISTANCE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSelectedDistance(option.value)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                            selectedDistance === option.value
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Filters */}
                  <div>
                    <h4 className="font-medium mb-3 text-sm">Availability</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowAvailableToday(!showAvailableToday)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm w-full transition-all",
                          showAvailableToday
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Available Today
                      </button>
                      <button
                        onClick={() => setShowOpenNow(!showOpenNow)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm w-full transition-all",
                          showOpenNow
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        <Clock className="w-4 h-4" />
                        Open Now
                      </button>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    {hasActiveFilters && (
                      <Button variant="outline" onClick={clearFilters} className="gap-2">
                        <X className="w-4 h-4" />
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="container px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">{filteredCenters.length}</span> centers found
              {dbCenters && dbCenters.length === 0 && (
                <span className="ml-2 text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                  Demo Data
                </span>
              )}
            </p>
            <Button variant="ghost" size="sm" className="gap-2">
              Sort by: Nearest
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : viewMode === "list" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCenters.map((center, index) => (
                <motion.div
                  key={center.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/center/${center.id}`} className="block group">
                    <div className="glass-card-hover p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                          {getServiceEmoji(center.service_types || [])}
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            // Toggle favorite
                          }}
                          className="p-2 rounded-full hover:bg-muted transition-colors"
                        >
                          <Heart className="w-5 h-5 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>

                      {/* Info */}
                      <h3 className="font-display font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                        {center.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {center.address}, {center.city}
                      </p>

                      {/* Services */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {center.service_types?.map((type) => (
                          <ServiceBadge key={type} serviceType={type} size="sm" showIcon={false} />
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <RatingStars 
                          rating={center.average_rating || 0} 
                          reviewCount={center.total_reviews || 0} 
                          size="sm" 
                        />
                        {center.distance !== undefined && (
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            {center.distance.toFixed(1)} km
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            center.isOpen 
                              ? "bg-primary/10 text-primary" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            {center.isOpen ? "Open" : "Closed"}
                          </span>
                          {center.availableToday && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                              Available Today
                            </span>
                          )}
                        </div>
                        {center.is_verified && (
                          <span className="text-xs text-primary flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass-card h-[600px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Map className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Map View Coming Soon</p>
                <p className="text-sm">Interactive map with center locations</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
