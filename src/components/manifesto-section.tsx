import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

const GlassShape = dynamic(() => import("./manifesto/glass-shape"), { ssr: false });

export default function ManifestoSection() {
  const t = useTranslations("Manifesto");

  return (
    <section className="w-full py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full ">
         <GlassShape />
      </div>
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col">
          
          {/* Left Column: Tagline */}
          <div className="flex flex-col">
             <h2 className="md:text-4xl  font-medium tracking-tight leading-tighter whitespace-pre-line text-foreground/90">
                {t("tagline")}
             </h2>
          </div>

          {/* Right Column: Description & CTA */}
          <div className="flex justify-end w-full mt-8 md:mt-12">
            <div className="flex flex-col gap-8 w-full md:w-3/4 lg:w-2/3">
              <p className="text-2xl md:text-3xl lg:text-5xl leading-tight font-medium text-foreground/80">
                  {t.rich('description', {
                      highlight: (chunks) => <span className="text-tertiary">{chunks}</span>,
                      newline: (chunks) => <br />,
                  })}
              </p>
    
    
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
