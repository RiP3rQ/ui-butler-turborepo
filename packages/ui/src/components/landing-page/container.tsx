"use client";

import { motion } from "framer-motion";
import { cn } from "@shared/ui/lib/utils";

interface ContainerProps {
  className?: string;
  children: React.ReactNode;
  delay?: number;
  reverse?: boolean;
}

export function Container({
  children,
  className,
  delay = 0.2,
  reverse,
}: Readonly<ContainerProps>): React.ReactNode {
  return (
    <motion.div
      className={cn("w-full h-full", className)}
      initial={{ opacity: 0, y: reverse ? -20 : 20 }}
      transition={{ delay, duration: 0.4, ease: "easeInOut" }}
      viewport={{ once: false }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}
