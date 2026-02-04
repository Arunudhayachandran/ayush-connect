import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl gradient-bg-primary p-12 md:p-16 text-center"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/10 blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">
                Start Your Wellness Journey Today
              </span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 max-w-3xl mx-auto text-balance">
              Ready to Experience Traditional Healing?
            </h2>

            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10">
              Join thousands of Indians who have discovered the power of AYUSH 
              healthcare. Find verified centers near you and book your first appointment.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/explore">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 gap-2 h-14 px-8 text-lg"
                >
                  Find Centers Near Me
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth?mode=register&role=center">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 h-14 px-8 text-lg"
                >
                  Register Your Center
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
