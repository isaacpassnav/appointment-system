import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FaGoogle, FaVideo, FaWhatsapp } from "react-icons/fa6";
import { SiStripe, SiZoom, SiHubspot, SiMailchimp } from "react-icons/si";

const integrations = [
  { icon: FaGoogle, name: "Google Calendar", href: "#" },
  { icon: SiStripe, name: "Stripe", href: "#" },
  { icon: SiZoom, name: "Zoom", href: "#" },
  { icon: FaWhatsapp, name: "WhatsApp", href: "#" },
  { icon: SiHubspot, name: "HubSpot CRM", href: "#" },
  { icon: SiMailchimp, name: "Mailchimp", href: "#" },
];

interface IntegrationRowProps {
  className?: string;
}

export function IntegrationRow({ className }: IntegrationRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={cn(
        "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 place-items-center py-16",
        className,
      )}
    >
      {integrations.map(({ icon: Icon, name }, idx) => (
        <motion.div
          key={name}
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="flex size-16 items-center justify-center rounded-xl bg-muted p-4 shadow-lg transition-all duration-300 hover:bg-primary/10 hover:shadow-primary/20"
        >
          <Icon className="h-8 w-8 text-foreground" />
        </motion.div>
      ))}
    </motion.div>
  );
}
