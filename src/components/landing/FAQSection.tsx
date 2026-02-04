import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is AYUSH?",
    answer: "AYUSH stands for Ayurveda, Yoga & Naturopathy, Unani, Siddha, and Homeopathy. These are traditional and alternative medicine systems recognized by the Government of India under the Ministry of AYUSH.",
  },
  {
    question: "Are the centers verified?",
    answer: "Yes, all centers on our platform undergo a thorough verification process. We check for valid licenses, practitioner qualifications, and adherence to government guidelines before listing them.",
  },
  {
    question: "How do I book an appointment?",
    answer: "Simply search for a service or center, select your preferred date and time slot, choose a doctor if needed, and confirm your booking. You'll receive instant confirmation via email and SMS.",
  },
  {
    question: "Can I cancel or reschedule my booking?",
    answer: "Yes, you can cancel or reschedule your booking up to 4 hours before the appointment time through your dashboard. Cancellation policies may vary by center.",
  },
  {
    question: "Is online payment available?",
    answer: "Currently, we support both online payment and pay-at-center options. You can choose your preferred payment method during the booking process.",
  },
  {
    question: "How are user reviews verified?",
    answer: "Reviews can only be submitted by users who have completed a booking at the center. We also have moderation systems to ensure authenticity and prevent fake reviews.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
            Got Questions?
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Everything you need to know about AYUSH services and our platform
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-display font-semibold text-lg pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-6 text-muted-foreground">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
