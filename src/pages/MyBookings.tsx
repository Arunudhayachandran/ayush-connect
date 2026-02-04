import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, X, RefreshCw, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ServiceBadge } from "@/components/ui/ServiceBadge";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { AyushServiceType } from "@/lib/constants";

type BookingStatus = "upcoming" | "completed" | "cancelled";

// Mock bookings for demo
const mockBookings = [
  {
    id: "1",
    centerName: "Ayurveda Wellness Center",
    centerImage: "🏥",
    serviceName: "Ayurvedic Consultation",
    serviceType: "ayurveda" as AyushServiceType,
    doctorName: "Dr. Anjali Sharma",
    date: "2024-02-15",
    time: "10:00 AM",
    status: "upcoming" as BookingStatus,
    amount: 800,
    address: "MG Road, Indiranagar, Bangalore",
  },
  {
    id: "2",
    centerName: "Yoga & Meditation Ashram",
    centerImage: "🧘",
    serviceName: "Yoga Session",
    serviceType: "yoga" as AyushServiceType,
    doctorName: "Dr. Ramesh Patel",
    date: "2024-02-20",
    time: "06:00 AM",
    status: "upcoming" as BookingStatus,
    amount: 500,
    address: "Yelahanka, Bangalore",
  },
  {
    id: "3",
    centerName: "Holistic Health Hub",
    centerImage: "🌿",
    serviceName: "Panchakarma Therapy",
    serviceType: "ayurveda" as AyushServiceType,
    doctorName: "Dr. Meera Nair",
    date: "2024-01-25",
    time: "02:00 PM",
    status: "completed" as BookingStatus,
    amount: 3500,
    address: "Koramangala, Bangalore",
  },
  {
    id: "4",
    centerName: "Dr. Sharma's Homeopathy Clinic",
    centerImage: "💊",
    serviceName: "Homeopathy Consultation",
    serviceType: "homeopathy" as AyushServiceType,
    doctorName: "Dr. Sharma",
    date: "2024-01-10",
    time: "11:00 AM",
    status: "cancelled" as BookingStatus,
    amount: 600,
    address: "Jayanagar, Bangalore",
  },
];

const tabs: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: "All Bookings" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState<BookingStatus | "all">("all");
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const filteredBookings = mockBookings.filter((booking) => 
    activeTab === "all" ? true : booking.status === activeTab
  );

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "upcoming":
        return "bg-primary/10 text-primary";
      case "completed":
        return "bg-green-500/10 text-green-600";
      case "cancelled":
        return "bg-destructive/10 text-destructive";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">My Bookings</h1>
              <p className="text-muted-foreground">
                Manage your appointments and booking history
              </p>
            </div>
            <Link to="/explore">
              <Button className="gradient-bg-primary border-0 text-primary-foreground gap-2">
                <Search className="w-4 h-4" />
                Book New Appointment
              </Button>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  activeTab === tab.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Center Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-3xl shrink-0">
                        {booking.centerImage}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                            getStatusColor(booking.status)
                          )}>
                            {booking.status}
                          </span>
                          <ServiceBadge serviceType={booking.serviceType} size="sm" showIcon={false} />
                        </div>
                        <h3 className="font-semibold text-lg truncate">{booking.serviceName}</h3>
                        <p className="text-muted-foreground text-sm truncate">
                          {booking.centerName} • {booking.doctorName}
                        </p>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(booking.date).toLocaleDateString("en-IN", { 
                          weekday: "short", 
                          day: "numeric", 
                          month: "short" 
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{booking.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate max-w-[150px]">{booking.address}</span>
                      </div>
                    </div>

                    {/* Amount & Actions */}
                    <div className="flex items-center gap-4 lg:gap-6">
                      <span className="font-semibold text-lg">₹{booking.amount}</span>
                      
                      {booking.status === "upcoming" && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-1">
                            <RefreshCw className="w-4 h-4" />
                            Reschedule
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive">
                            <X className="w-4 h-4" />
                            Cancel
                          </Button>
                        </div>
                      )}
                      
                      {booking.status === "completed" && (
                        <Button variant="outline" size="sm" className="gap-1">
                          Write Review
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {booking.status === "cancelled" && (
                        <Button variant="outline" size="sm" className="gap-1">
                          Book Again
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-4xl mx-auto mb-4">
                📅
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">No bookings found</h3>
              <p className="text-muted-foreground mb-6">
                {activeTab === "upcoming" 
                  ? "You don't have any upcoming appointments"
                  : activeTab === "completed"
                  ? "You haven't completed any appointments yet"
                  : activeTab === "cancelled"
                  ? "You haven't cancelled any appointments"
                  : "Start by booking your first wellness appointment"
                }
              </p>
              <Link to="/explore">
                <Button className="gradient-bg-primary border-0 text-primary-foreground">
                  Explore Centers
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
