import { Link } from "react-router-dom";
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const footerLinks = {
  services: [
    { label: "Ayurveda", href: "/explore?service=ayurveda" },
    { label: "Yoga & Wellness", href: "/explore?service=yoga" },
    { label: "Naturopathy", href: "/explore?service=naturopathy" },
    { label: "Unani Medicine", href: "/explore?service=unani" },
    { label: "Siddha", href: "/explore?service=siddha" },
    { label: "Homeopathy", href: "/explore?service=homeopathy" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "How it Works", href: "/how-it-works" },
    { label: "Partner with Us", href: "/partner" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "FAQ", href: "/faq" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center">
                <span className="text-xl">🌿</span>
              </div>
              <span className="font-display font-bold text-xl">AYUSH Wellness Hub</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Discover authentic AYUSH healthcare services across India. Connect with verified 
              practitioners and book appointments seamlessly.
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>support@ayushwellness.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+91 1800-XXX-XXXX</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>New Delhi, India</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-destructive fill-destructive" /> in India
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AYUSH Wellness Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
