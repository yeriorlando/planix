"use client";
import React from "react";
import { motion } from "framer-motion";

export interface TestimonialItem {
  text: string;
  image: string;
  name: string;
  role: string;
}

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: TestimonialItem[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-transparent"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <div 
                  className="p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 shadow-md shadow-zinc-950/5 max-w-xs w-full hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all duration-300 select-none" 
                  key={i}
                >
                  <div className="text-zinc-700 dark:text-zinc-300 font-bold text-sm leading-relaxed">&quot;{text}&quot;</div>
                  <div className="flex items-center gap-3 mt-5">
                    <img
                      width={40}
                      height={40}
                      src={image}
                      alt={name}
                      className="h-10 w-10 rounded-full object-cover border border-zinc-200/40 dark:border-zinc-700/50"
                    />
                    <div className="flex flex-col">
                      <div className="font-extrabold text-sm text-zinc-900 dark:text-white leading-none">{name}</div>
                      <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 leading-none mt-1.5">{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};
