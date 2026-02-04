import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, Clock, Phone, Globe, Star, Heart, Share2, 
  Calendar, ArrowLeft, Navigation, CheckCircle, Users,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ServiceBadge } from "@/components/ui/ServiceBadge";
import { RatingStars } from "@/components/ui/RatingStars";
import { cn } from "@/lib/utils";
import type { AyushServiceType } from "@/lib/constants";

// Mock data
const mockCenter = {
  id: "1",
  name: "Ayurveda Wellness Center",
  description: "A premier Ayurvedic healthcare center offering authentic Panchakarma treatments, consultations, and holistic wellness programs. Our experienced practitioners combine traditional wisdom with modern techniques to provide personalized healing experiences.",
  address: "123 MG Road, Indiranagar, Bangalore, Karnataka 560038",
  phone: "+91 80 1234 5678",
  email: "info@ayurvedawellness.in",
  website: "www.ayurvedawellness.in",
  rating: 4.8,
  reviewCount: 156,
  totalBookings: 2340,
  serviceTypes: ["ayurveda", "yoga", "naturopathy"] as AyushServiceType[],
  openingTime: "09:00",
  closingTime: "18:00",
  workingDays: [1, 2, 3, 4, 5, 6],
  isVerified: true,
  photos: ["🏥", "🌿", "🧘", "💆"],
};

const mockServices = [
  { id: "1", name: "Ayurvedic Consultation", duration: 45, price: 800, type: "ayurveda" as AyushServiceType },
  { id: "2", name: "Panchakarma Therapy", duration: 120, price: 3500, type: "ayurveda" as AyushServiceType },
  { id: "3", name: "Shirodhara Treatment", duration: 60, price: 1500, type: "ayurveda" as AyushServiceType },
  { id: "4", name: "Yoga Session", duration: 60, price: 500, type: "yoga" as AyushServiceType },
  { id: "5", name: "Abhyanga Massage", duration: 90, price: 2000, type: "ayurveda" as AyushServiceType },
];

const mockDoctors = [
  { id: "1", name: "Dr. Anjali Sharma", specialization: "ayurveda", experience: 15, rating: 4.9 },
  { id: "2", name: "Dr. Ramesh Patel", specialization: "yoga", experience: 12, rating: 4.7 },
  { id: "3", name: "Dr. Meera Nair", specialization: "naturopathy", experience: 8, rating: 4.8 },
];

const mockReviews = [
  { id: "1", user: "Priya S.", rating: 5, comment: "Excellent treatment! Dr. Sharma is very knowledgeable.", date: "2 days ago" },
  { id: "2", user: "Rahul M.", rating: 5, comment: "The Panchakarma therapy was life-changing. Highly recommend!", date: "1 week ago" },
  { id: "3", user: "Anita K.", rating: 4, comment: "Great ambiance and professional staff. Will visit again.", date: "2 weeks ago" },
];

const tabs = ["Overview", "Services", "Doctors", "Reviews"];

export default function CenterDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const [isFavorite, setIsFavorite] = useState(false);

  const isOpen = true; // Would be calculated based on time
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b border-border py-3">
          <div className="container px-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/explore" className="hover:text-foreground flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Back to Explore
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground">{mockCenter.name}</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-b from-muted/50 to-background py-8">
          <div className="container px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Photos */}
              <div className="lg:w-1/2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 aspect-video rounded-2xl bg-primary/10 flex items-center justify-center text-8xl">
                    {mockCenter.photos[0]}
                  </div>
                  {mockCenter.photos.slice(1).map((photo, i) => (
                    <div key={i} className="aspect-video rounded-xl bg-primary/5 flex items-center justify-center text-5xl">
                      {photo}
                    </div>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="lg:w-1/2">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    {mockCenter.isVerified && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full mb-2">
                        <CheckCircle className="w-3 h-3" />
                        Verified Center
                      </span>
                    )}
                    <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                      {mockCenter.name}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <RatingStars rating={mockCenter.rating} reviewCount={mockCenter.reviewCount} />
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {mockCenter.totalBookings.toLocaleString()} bookings
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsFavorite(!isFavorite)}
                      className="rounded-full"
                    >
                      <Heart className={cn("w-5 h-5", isFavorite && "fill-destructive text-destructive")} />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Services */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {mockCenter.serviceTypes.map((type) => (
                    <ServiceBadge key={type} serviceType={type} />
                  ))}
                </div>

                {/* Quick Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
                    <span>{mockCenter.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span className={cn(isOpen ? "text-primary" : "text-muted-foreground")}>
                      {isOpen ? "Open" : "Closed"} • {mockCenter.openingTime} - {mockCenter.closingTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <span>{mockCenter.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <a href={`https://${mockCenter.website}`} className="text-primary hover:underline">
                      {mockCenter.website}
                    </a>
                  </div>
                </div>

                {/* Working Days */}
                <div className="flex gap-1 mb-6">
                  {dayNames.map((day, index) => (
                    <span
                      key={day}
                      className={cn(
                        "w-9 h-9 rounded-full text-xs font-medium flex items-center justify-center",
                        mockCenter.workingDays.includes(index)
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {day}
                    </span>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <Button size="lg" className="flex-1 gradient-bg-primary border-0 text-primary-foreground gap-2">
                    <Calendar className="w-5 h-5" />
                    Book Appointment
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2">
                    <Navigation className="w-5 h-5" />
                    Directions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-16 bg-background border-b border-border z-40">
          <div className="container px-4">
            <div className="flex gap-8 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="container px-4 py-8">
          {activeTab === "Overview" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <h2 className="font-display text-2xl font-semibold mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                {mockCenter.description}
              </p>

              <h3 className="font-display text-xl font-semibold mb-4">Location</h3>
              <div className="glass-card h-64 flex items-center justify-center text-muted-foreground">
                🗺️ Map coming soon
              </div>
            </motion.div>
          )}

          {activeTab === "Services" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {mockServices.map((service) => (
                <div key={service.id} className="glass-card p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <ServiceBadge serviceType={service.type} showIcon />
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">{service.duration} minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-lg">₹{service.price}</span>
                    <Button className="gradient-bg-primary border-0 text-primary-foreground">
                      Book Now
                    </Button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "Doctors" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {mockDoctors.map((doctor) => (
                <div key={doctor.id} className="glass-card p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl mx-auto mb-4">
                    👨‍⚕️
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-1">{doctor.name}</h3>
                  <ServiceBadge serviceType={doctor.specialization as AyushServiceType} size="sm" className="mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">
                    {doctor.experience} years experience
                  </p>
                  <RatingStars rating={doctor.rating} size="sm" className="justify-center" />
                  <Button variant="outline" className="w-full mt-4">
                    View Profile
                  </Button>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "Reviews" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl space-y-6"
            >
              {mockReviews.map((review) => (
                <div key={review.id} className="glass-card p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        {review.user[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold">{review.user}</h4>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    <RatingStars rating={review.rating} size="sm" showValue={false} />
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                Load More Reviews
              </Button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
