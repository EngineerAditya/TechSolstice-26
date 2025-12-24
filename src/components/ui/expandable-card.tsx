"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ExpandableCardProps {
  title: string;
  src?: string;
  description?: string;
  children?: React.ReactNode;      // front overlay content
  backContent?: React.ReactNode;   // back overlay content
  isFlipped?: boolean;             // controlled from parent
  className?: string;
  classNameExpanded?: string;
  [key: string]: any;
}

export function ExpandableCard({
  title,
  src = "",
  description = "",
  children,
  backContent,
  isFlipped = false,
  className,
  classNameExpanded,
  ...props
}: ExpandableCardProps) {
  const [active, setActive] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const id = React.useId();

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(false);
    };

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setActive(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/30 backdrop-blur-md h-full w-full z-10"
          />
        )}
      </AnimatePresence>

      {/* Expanded overlay – whole card flips */}
      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 grid place-items-center z-100 sm:mt-16 before:pointer-events-none bg-black/50">
            <motion.div
              layoutId={`card-${title}-${id}`}
              ref={cardRef}
              className={cn(
                "w-full max-w-212.5 h-[80vh] relative perspective-[1000px]",
                classNameExpanded,
              )}
              {...props}
            >
              {/* 3D wrapper that rotates */}
              <div
                className={cn(
                  "absolute inset-0 transition-transform duration-700 ease-in-out transform-3d",
                  isFlipped ? "transform-[rotateY(180deg)]" : "",
                )}
              >
                {/* FRONT face – full card, with border & radius */}
                <div className="absolute inset-0 backface-hidden rounded-3xl bg-black/60 shadow-sm border border-gray-200/50 overflow-hidden flex flex-col">
                  {/* Image */}
                  <motion.div layoutId={`image-${title}-${id}`}>
                    <div className="relative before:absolute before:inset-x-0 before:-bottom-px before:h-17.5 before:z-50 before:bg-linear-to-t before:from-transparent before:to-white/5">
                      {src ? (
                        <img
                          src={src}
                          alt={title}
                          className="w-full h-80 object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-80 bg-linear-to-br from-gray-800 to-transparent" />
                      )}
                    </div>
                  </motion.div>

                  {/* Header + front body */}
                  <div className="relative flex-1 before:absolute before:inset-x-0 before:bottom-0 before:h-17.5 before:z-50 before:bg-linear-to-t before:from-transparent before:to-white/5">
                    <div className="flex justify-between items-start p-6">
                      <div>
                        <motion.p
                          layoutId={`description-${description}-${id}`}
                          className="text-zinc-500 dark:text-zinc-400 text-base"
                        >
                          {description}
                        </motion.p>
                        <motion.h3
                          layoutId={`title-${title}-${id}`}
                          className="font-semibold text-black dark:text-white text-2xl sm:text-3xl mt-1"
                        >
                          {title}
                        </motion.h3>
                      </div>

                      {/* Close button */}
                      <motion.button
                        aria-label="Close card"
                        layoutId={`button-${title}-${id}`}
                        className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-transparent text-white hover:bg-white border border-white hover:border-gray-300/70 hover:text-black transition-colors duration-300 focus:outline-none"
                        onClick={() => setActive(false)}
                      >
                        <motion.div
                          animate={{ rotate: active ? 45 : 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </motion.div>
                      </motion.button>
                    </div>

                    <div className="relative px-4 sm:px-6 pb-10 h-[calc(100%-80px)] overflow-auto">
                      <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-zinc-500 dark:text-zinc-400 text-base pb-10 flex flex-col items-start gap-4"
                      >
                        {children}
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* BACK face – full card */}
                <div className="absolute inset-0 backface-hidden transform-[rotateY(180deg)] rounded-3xl bg-slate-900 shadow-sm border border-gray-200/50 overflow-hidden flex flex-col">
                  {backContent}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Collapsed card */}
      <motion.div
        role="dialog"
        aria-labelledby={`card-title-${id}`}
        aria-modal="true"
        layoutId={`card-${title}-${id}`}
        onClick={() => setActive(true)}
        className={cn(
          "p-3 flex flex-col justify-between items-center bg-white/5 shadow-sm rounded-2xl cursor-pointer border-2 border-gray-600/70",
          className,
        )}
      >
        <div className="flex gap-4 flex-col sm:flex-row items-start">
          <motion.div layoutId={`image-${title}-${id}`}>
            {src ? (
              <img
                src={src}
                alt={title}
                className="w-full sm:w-64 h-40 sm:h-56 rounded-lg object-cover object-center"
              />
            ) : (
              <div className="w-full sm:w-64 h-40 sm:h-56 rounded-lg bg-linear-to-br from-gray-800 to-transparent" />
            )}
          </motion.div>
          <div className="flex-1">
            <motion.h3
              id={`card-title-${id}`}
              layoutId={`title-${title}-${id}`}
              className="text-black dark:text-white md:text-left font-semibold text-lg sm:text-xl"
            >
              {title}
            </motion.h3>
            <motion.p
              layoutId={`description-${description}-${id}`}
              className="text-zinc-500 dark:text-zinc-400 md:text-left text-sm font-medium"
            >
              {description}
            </motion.p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default ExpandableCard;
