import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, MapPin, Filter, X, Map, List, Star, Clock, 
  ChevronDown, CheckCircle, Heart, ArrowRight, Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ServiceBadge } from "@/components/ui/ServiceBadge";
import { RatingStars } from "@/components/ui/RatingStars";
import { AYUSH_SERVICES, DISTANCE_OPTIONS, type AyushServiceType } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Mock data for demo
const mockCenters = [
  {
    id: "1",
    name: "Ayurveda Wellness Center",
    address: "MG Road, Indiranagar",
    city: "Bangalore",
    distance: 2.5,
    rating: 4.8,
    reviewCount: 156,
    serviceTypes: ["ayurveda", "yoga"] as AyushServiceType[],
    isOpen: true,
    availableToday: true,
    priceRange: "₹500 - ₹2000",
    image: "🏥",
  },
  {
    id: "2",
    name: "Holistic Health Hub",
    address: "Koramangala 4th Block",
    city: "Bangalore",
    distance: 4.2,
    rating: 4.6,
    reviewCount: 89,
    serviceTypes: ["naturopathy", "yoga", "ayurveda"] as AyushServiceType[],
    isOpen: true,
    availableToday: true,
    priceRange: "₹800 - ₹3000",
    image: "🌿",
  },
  {
    id: "3",
    name: "Dr. Sharma's Homeopathy Clinic",
    address: "Jayanagar 9th Block",
    city: "Bangalore",
    distance: 5.8,
    rating: 4.9,
    reviewCount: 234,
    serviceTypes: ["homeopathy"] as AyushServiceType[],
    isOpen: false,
    availableToday: false,
    priceRange: "₹300 - ₹800",
    image: "💊",
  },
  {
    id: "4",
    name: "Siddha Traditional Medicine Center",
    address: "BTM Layout",
    city: "Bangalore",
    distance: 7.1,
    rating: 4.5,
    reviewCount: 67,
    serviceTypes: ["siddha", "ayurveda"] as AyushServiceType[],
    isOpen: true,
    availableToday: true,
    priceRange: "₹600 - ₹1500",
    image: "🔮",
  },
  {
    id: "5",
    name: "Unani Wellness Clinic",
    address: "Whitefield",
    city: "Bangalore",
    distance: 12.3,
    rating: 4.4,
    reviewCount: 45,
    serviceTypes: ["unani"] as AyushServiceType[],
    isOpen: true,
    availableToday: false,
    priceRange: "₹400 - ₹1200",
    image: "⚗️",
  },
  {
    id: "6",
    name: "Yoga & Meditation Ashram",
    address: "Yelahanka",
    city: "Bangalore",
    distance: 15.6,
    rating: 4.7,
    reviewCount: 198,
    serviceTypes: ["yoga", "naturopathy"] as AyushServiceType[],
    isOpen: true,
    availableToday: true,
    priceRange: "₹200 - ₹1000",
    image: "🧘",
  },
];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedServices, setSelectedServices] = useState<AyushServiceType[]>([]);
  const [selectedDistance, setSelectedDistance] = useState("25");
  const [showAvailableToday, setShowAvailableToday] = useState(false);
  const [showOpenNow, setShowOpenNow] = useState(false);

  const toggleService = (serviceId: AyushServiceType) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((s) => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  const filteredCenters = mockCenters.filter((center) => {
    if (selectedServices.length > 0 && !selectedServices.some((s) => center.serviceTypes.includes(s))) {
      return false;
    }
    if (showAvailableToday && !center.availableToday) return false;
    if (showOpenNow && !center.isOpen) return false;
    if (center.distance > parseFloat(selectedDistance)) return false;
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
            </p>
            <Button variant="ghost" size="sm" className="gap-2">
              Sort by: Nearest
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          {viewMode === "list" ? (
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
                          {center.image}
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
                        {center.serviceTypes.map((type) => (
                          <ServiceBadge key={type} serviceType={type} size="sm" showIcon={false} />
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <RatingStars rating={center.rating} reviewCount={center.reviewCount} size="sm" />
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Navigation className="w-3 h-3" />
                          {center.distance} km
                        </span>
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
                        <span className="text-sm text-muted-foreground">
                          {center.priceRange}
                        </span>
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
