import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface HeroProps {
  revealed: boolean;
}

export default function Hero({ revealed }: HeroProps) {
  const t = useTranslations('Hero');

  return (
    <section className="relative flex-1 flex flex-col items-center justify-center p-10 pt-32 text-center space-y-8 overflow-hidden">


       <div 
        className={cn(
          "relative z-10 space-y-4 max-w-3xl transition-all duration-1000 ease-out delay-200",
          revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[20px]"
        )}
       >
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-none">
            {t('headline_prefix')} <br/>
            <span className="text-tertiary">{t('headline_suffix')}</span>{t('headline_end')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            {t('subtext')}
          </p>
       </div>
    </section>
  );
}
