"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Feature {
  icon: string; // Heroicon or react-icons className
  title: string;
  description: string;
  points?: string[];
}

interface FeaturesCardProps {
  feature: Feature;
  className?: string;
  index?: number;
}

export function FeaturesCard({
  feature,
  className,
  index = 0,
}: FeaturesCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className={cn("group", className)}
    >
      <Card className="h-full overflow-hidden border-0 bg-card/50 shadow-xl backdrop-blur-sm transition-all duration-500 hover:bg-card hover:shadow-2xl hover:shadow-primary/10">
        <CardHeader className="pb-4">
          <div className="mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 shadow-inner group-hover:scale-110">
            <div className={cn("h-12 w-12", feature.icon, "animate-pulse")} />
          </div>
          <CardTitle className="group-hover:text-primary transition-colors">
            {feature.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground">{feature.description}</p>
          {feature.points && (
            <ul className="space-y-2 text-sm">
              {feature.points.map((point, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  {point}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
