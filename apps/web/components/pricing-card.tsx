"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FaCheck } from "react-icons/fa6";
import { FaXmark } from "react-icons/fa6";

type PricingFeature = { text: string; allTiers?: boolean };

interface PricingCardProps {
  tier: "starter" | "pro" | "business" | "enterprise";
  price: string;
  features: PricingFeature[];
  popular?: boolean;
  ctaText?: string;
  className?: string;
}

const tierConfig = {
  starter: { name: "Starter", subtitle: "Free forever" },
  pro: { name: "Pro", subtitle: "Most popular" },
  business: { name: "Business", subtitle: "For teams" },
  enterprise: { name: "Enterprise", subtitle: "Custom solution" },
};

export function PricingCard({
  tier,
  price,
  features,
  popular = false,
  ctaText = "Get Started",
  className,
}: PricingCardProps) {
  const config = tierConfig[tier];

  const isAvailable = (
    feature: PricingFeature,
    t: PricingCardProps["tier"],
  ) => {
    if (feature.allTiers) return true;
    const order = { starter: 0, pro: 1, business: 2, enterprise: 3 } as const;
    return order[t] >= order[tier];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card p-8 shadow-xl transition-all duration-500 hover:shadow-2xl",
        popular && "ring-4 ring-primary/20 shadow-primary/20",
        className,
      )}
    >
      {popular && (
        <Badge className="absolute -top-3 left-1/2 mx-auto w-fit -translate-x-1/2 bg-primary font-bold">
          Most Popular
        </Badge>
      )}
      <div className="space-y-4 text-center">
        <h3 className="text-2xl font-bold">{config.name}</h3>
        <p className="text-sm text-muted-foreground">{config.subtitle}</p>
        <div className="text-4xl font-bold text-primary">{price}</div>
        <ul className="space-y-3">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center justify-center gap-3">
              {isAvailable(feature, tier) ? (
                <FaCheck className="h-5 w-5 text-green-500" />
              ) : (
                <FaXmark className="h-5 w-5 text-muted-foreground" />
              )}
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>
        <Button
          className="w-full font-bold shadow-lg hover:shadow-primary/20"
          size="lg"
        >
          {ctaText}
        </Button>
      </div>
    </motion.div>
  );
}
