import { motion } from "framer-motion";
import { Building2, Users, MapPin, Award } from "lucide-react";

const stats = [
  { icon: Building2, value: "2,500+", label: "Verified Centers" },
  { icon: Users, value: "50,000+", label: "Happy Users" },
  { icon: MapPin, value: "150+", label: "Cities Covered" },
  { icon: Award, value: "4.8/5", label: "Average Rating" },
];

export function StatsSection() {
  return (
    <section className="py-16 border-y border-border bg-card">
      <div className="container px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-7 h-7 text-primary" />
              </div>
              <div className="font-display text-3xl md:text-4xl font-bold gradient-text mb-1">
                {stat.value}
              </div>
              <div className="text-muted-foreground text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
