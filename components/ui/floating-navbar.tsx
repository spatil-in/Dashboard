
"use client";

import React, { useState } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
} from "motion/react";

import { cn } from "@/lib/utils";

interface FloatingNavProps {
  navItems: {
    name: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
}

export const FloatingNav = ({
  navItems,
  className,
}: FloatingNavProps) => {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;

    if (current < 50) {
      setVisible(false);
    } else if (current < previous) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{
        y: visible ? 0 : -100,
        opacity: visible ? 1 : 0,
      }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className={cn(
        "fixed top-5 inset-x-0 z-[5000] mx-auto flex w-fit max-w-[95%] items-center justify-center",
        className
      )}
    >
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/80 px-2 py-1.5 shadow-lg shadow-black/10 backdrop-blur-md dark:bg-black/50">

        {/* Navigation Items */}
        <div className="flex items-center gap-1">
          {navItems.map((navItem, idx) => (
            <a
              key={navItem.link || idx}
              href={navItem.link}
              className="relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <span className="block sm:hidden">
                {navItem.icon}
              </span>

              <span className="hidden sm:block">
                {navItem.name}
              </span>
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-neutral-200 dark:bg-white/10" />

        {/* Login Button */}
        <a
          href="/login"
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-neutral-800 dark:bg-white dark:text-black"
        >
          Login
        </a>

      </div>
    </motion.div>
  );
};
