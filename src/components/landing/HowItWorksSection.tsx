import { motion } from "framer-motion";
import { Search, MapPin, Calendar, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search Services",
    description: "Browse AYUSH services or search for specific treatments, centers, or practitioners near you.",
    color: "hsl(152 45% 28%)",
  },
  {
    icon: MapPin,
    title: "Find Nearby Centers",
    description: "Use location-based search to discover verified wellness centers within your preferred distance.",
    color: "hsl(262 47% 55%)",
  },
  {
    icon: Calendar,
    title: "Book Appointment",
    description: "Select your preferred date, time, and doctor. Confirm your booking instantly online.",
    color: "hsl(38 92% 50%)",
  },
  {
    icon: CheckCircle,
    title: "Get Treated",
    description: "Visit the center for your appointment. Rate and review your experience to help others.",
    color: "hsl(142 55% 42%)",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Simple Process
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Book your AYUSH consultation in just a few simple steps
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
                {/* Step Number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-background border-2 border-primary text-primary font-bold text-sm flex items-center justify-center z-10">
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-6 transition-transform hover:scale-110"
                  style={{ backgroundColor: `${step.color}15` }}
                >
                  <step.icon className="w-9 h-9" style={{ color: step.color }} />
                </div>

                <h3 className="font-display text-lg font-semibold mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
