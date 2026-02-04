"use client";

import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceItemProps {
  number: string;
  title: string;
  desc: string;
  isOpen: boolean;
  onClick: () => void;
  Icon: React.FC;
  videoSrc?: string;
  customContent?: React.ReactNode;
}

export default function ServiceItem({
  number,
  title,
  desc,
  isOpen,
  onClick,
  Icon,
  videoSrc,
  customContent,
}: ServiceItemProps) {
  return (
    <div className="border-t border-border/40 last:border-b">
      <button
        onClick={onClick}
        className="w-full py-12 flex items-start justify-between group text-left focus:outline-hidden lg:pl-20"
      >
        <div className="flex items-start gap-6 md:gap-12">
            
           {/* Icon Container */}
           <div className={cn(
               "transition-colors duration-500 text-muted-foreground group-hover:text-foreground",
               isOpen ? "text-tertiary" : ""
           )}>
               <Icon />
           </div>

          <div className="space-y-2">
             <span className="text-sm font-mono text-muted-foreground block mb-2">{number}</span>
            <h3 className={cn(
                "text-3xl md:text-5xl font-medium tracking-tight transition-colors duration-300",
                isOpen ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
            )}>
              {title}
            </h3>
          </div>
        </div>

        <div className="relative w-8 h-8 flex items-center justify-center">
           {/* Plus Icon (Closed) */}
           <motion.div
             initial={false}
             animate={{ 
                 opacity: isOpen ? 0 : 1,
                 rotate: isOpen ? 90 : 0,
                 scale: isOpen ? 0.5 : 1
             }}
             transition={{ duration: 0.3 }}
             className="absolute"
           >
               <Plus className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" />
           </motion.div>
           
           {/* Minus Icon (Open) */}
           <motion.div
             initial={false}
             animate={{ 
                 opacity: isOpen ? 1 : 0,
                 rotate: isOpen ? 0 : -90,
                 scale: isOpen ? 1 : 0.5
             }}
             transition={{ duration: 0.3 }}
             className="absolute"
           >
               <Minus className="w-8 h-8 text-tertiary" />
           </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="pb-12 md:pl-[6rem] lg:pl-[11rem] md:pr-24">
              
              {/* Media Box (Video or Gradient) */}
              <div className="w-full aspect-square md:aspect-video rounded-xl mb-8 border border-border/50 overflow-hidden relative bg-muted/20">
                 {videoSrc ? (
                     <video 
                        src={videoSrc}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                     />
                 ) : customContent ? (
                     <div className="w-full h-full">
                        {customContent}
                     </div>
                 ) : (
                     <div className="w-full h-full bg-gradient-to-br from-tertiary/20 to-muted" />
                 )}
              </div>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {desc}
              </p>
              
              <div className="mt-8 flex flex-wrap gap-1">
                  {/* Decorative Tags based on service type */}
                  {title.includes("Web") && ["UX/UI", "React", "Next.js", "WebGL"].map(tag => (
                      <span key={tag} className="text-xs font-mono uppercase border border-border px-3 py-1 rounded-sm text-tertiary bg-tertiary-foreground">{tag}</span>
                  ))}
                  {title.includes("Brand") && ["Strategy", "Logo", "Guidelines", "Print"].map(tag => (
                      <span key={tag} className="text-xs font-mono uppercase border border-border px-3 py-1 rounded-sm text-tertiary bg-tertiary-foreground">{tag}</span>
                  ))}
                   {/* Fallback tags */}
                    {!title.includes("Web") && !title.includes("Brand") && ["n8n", "Moltbot", "Agentic Workflow", "Growth"].map(tag => (
                      <span key={tag} className="text-xs font-mono uppercase border border-border px-3 py-1 rounded-sm text-tertiary bg-tertiary-foreground">{tag}</span>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
