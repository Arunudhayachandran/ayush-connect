import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai, Maharashtra",
    avatar: "👩",
    rating: 5,
    service: "Ayurveda",
    comment: "Found an amazing Ayurvedic center through this app. The booking was seamless, and the treatment for my chronic back pain has shown incredible results. Highly recommended!",
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    location: "Delhi",
    avatar: "👨",
    rating: 5,
    service: "Yoga",
    comment: "As someone who was skeptical about online booking for wellness services, this app changed my perspective. The yoga instructor I found has transformed my daily routine completely.",
  },
  {
    id: 3,
    name: "Anita Desai",
    location: "Bangalore, Karnataka",
    avatar: "👩",
    rating: 5,
    service: "Homeopathy",
    comment: "The homeopathic doctor I found through this platform has been treating my family for 6 months now. The convenience of booking and genuine reviews helped me make the right choice.",
  },
  {
    id: 4,
    name: "Vikram Singh",
    location: "Jaipur, Rajasthan",
    avatar: "👨",
    rating: 5,
    service: "Naturopathy",
    comment: "Underwent a Panchakarma detox at a center I discovered here. The entire experience from booking to treatment was premium. My health has never been better!",
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-24 bg-muted/30 overflow-hidden">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Success Stories
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4">
            What Our <span className="gradient-text">Users Say</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Real experiences from people who found their path to wellness
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main Testimonial */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-8 md:p-12 text-center"
            >
              <Quote className="w-12 h-12 text-primary/20 mx-auto mb-6" />
              
              <p className="text-lg md:text-xl text-foreground mb-8 leading-relaxed">
                "{testimonials[currentIndex].comment}"
              </p>

              <div className="flex items-center justify-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-secondary fill-secondary"
                  />
                ))}
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl mb-3">
                  {testimonials[currentIndex].avatar}
                </div>
                <h4 className="font-display font-semibold text-lg">
                  {testimonials[currentIndex].name}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {testimonials[currentIndex].location}
                </p>
                <span className="mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {testimonials[currentIndex].service}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "w-8 bg-primary"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={next}
              className="rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
