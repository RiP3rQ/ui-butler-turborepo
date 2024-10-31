"use client";

import { motion } from "framer-motion";
import { cn } from "@repo/ui/lib/utils";

interface Props {
  className?: string;
  children: React.ReactNode;
  delay?: number;
  reverse?: boolean;
}

function Container({ children, className, delay = 0.2, reverse }: Props) {
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

export default Container;
