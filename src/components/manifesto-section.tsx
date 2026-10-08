"use client";

import { useTranslations } from "next-intl";
import ApplicationSystemPreview from "@/components/application-system-preview";
import CommercePreview from "@/components/commerce-preview";
import AiChatPreview from "@/components/ai-chat-preview";
import AutomationWorkflowPreview from "@/components/automation-workflow-preview";
import CrmDashboardPreview from "@/components/crm-dashboard-preview";
import { cn } from "@/lib/utils";

const ideas = [
  {
    key: "commerce",
    layout: "lg:col-span-6",
    visual: "aspect-[30/17] lg:aspect-auto lg:h-100",
  },
  { key: "applications", layout: "lg:col-span-6", visual: "h-68 sm:h-84" },
  { key: "crm", layout: "lg:col-span-4", visual: "min-h-96 flex-1" },
  { key: "automation", layout: "lg:col-span-4", visual: "h-72" },
  { key: "assistant", layout: "md:col-span-2 lg:col-span-4", visual: "h-72" },
] as const;

type Idea = (typeof ideas)[number]["key"];

const glowPositions = {
  commerce: ["-right-1/4 bottom-0", "-left-1/4 bottom-0"],
  applications: ["-left-1/4 -top-1/4", "-right-1/4 top-0"],
  crm: ["-left-1/4 -top-1/4", "-right-1/4 top-0"],
  automation: ["-left-1/4 -top-1/4", "-right-1/4 top-0"],
  assistant: ["-right-1/4 -top-1/4", "-left-1/4 top-0"],
} as const;

function BentoGlow({ kind }: { kind: Idea }) {
  const [accent, highlight] = glowPositions[kind];

  return (
    <div
      data-scroll-reveal="fade"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <span
        className={cn(
          "absolute h-3/4 w-full bg-radial from-tertiary/18 via-tertiary/6 to-transparent blur-2xl dark:from-tertiary/14 dark:via-tertiary/5",
          accent,
        )}
      />
      <span
        className={cn(
          "absolute h-2/3 w-3/4 bg-radial from-sky-200/25 via-sky-100/8 to-transparent blur-2xl dark:from-indigo-300/12 dark:via-indigo-300/4",
          highlight,
        )}
      />
    </div>
  );
}

function Preview({ kind }: { kind: Idea }) {
  if (kind === "commerce") return <CommercePreview />;
  if (kind === "assistant") return <AiChatPreview />;
  if (kind === "automation") return <AutomationWorkflowPreview />;
  if (kind === "applications") return <ApplicationSystemPreview />;
  return <CrmDashboardPreview />;
}

export default function ManifestoSection() {
  const t = useTranslations("Possibilities");

  return (
    <section
      aria-labelledby="possibilities-heading"
      className="relative overflow-hidden bg-background px-[clamp(20px,4.2vw,72px)] py-section text-foreground"
    >
      <div className="w-full">
        <header className="mb-12 flex flex-col justify-between gap-8 lg:mb-16 lg:flex-row lg:items-end">
          <div>
            <h2
              data-scroll-reveal="text"
              id="possibilities-heading"
              className="max-w-3xl whitespace-pre-line text-[clamp(32px,3.2vw,48px)] leading-[1.15] font-medium tracking-[-0.055em] [word-break:keep-all]"
            >
              {t("heading")}
            </h2>
          </div>
        </header>

        <div className="relative grid items-stretch md:grid-cols-2 lg:grid-cols-12">
          <span data-scroll-reveal="line-y" aria-hidden="true" className="pointer-events-none absolute inset-y-0 inset-x-0 border-x border-foreground/17" />
          <span
            data-scroll-reveal="line-x"
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 border-b border-foreground/17"
          />
          {ideas.map(({ key, layout, visual }, index) => (
            <div key={key} className={cn("relative min-w-0", layout)}>
              {/* Overlay dividers so borders do not inset the junction marks. */}
              <span
                data-scroll-reveal="line-y"
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-px bg-foreground/17",
                  (index === 0 || index === 2) && "md:block",
                  index === 3 && "lg:block",
                )}
              />
              <span
                data-scroll-reveal="line-x"
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 z-10 border-t border-foreground/17"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 text-foreground/40"
              >
                <span data-scroll-reveal="fade" className="absolute top-0 left-0 size-3.5 border-t border-l border-current" />
                <span data-scroll-reveal="fade" className="absolute top-0 right-0 size-3.5 border-t border-r border-current" />
                <span data-scroll-reveal="fade" className="absolute bottom-0 left-0 size-3.5 border-b border-l border-current" />
                <span data-scroll-reveal="fade" className="absolute right-0 bottom-0 size-3.5 border-r border-b border-current" />
              </div>
              <article className="relative z-0 isolate h-full overflow-hidden text-foreground">
                <BentoGlow kind={key} />
                <div
                  className={cn(
                    "flex h-full flex-col gap-7 p-7 md:gap-10 md:p-10",
                    key === "crm" && "gap-6 md:gap-7",
                  )}
                >
                  <div
                    data-scroll-reveal="fade"
                    aria-hidden={
                      key === "automation" || key === "commerce"
                        ? undefined
                        : true
                    }
                    className={cn(
                      "pointer-events-none shrink-0 overflow-hidden select-none",
                      visual,
                      key === "commerce" && "-mx-7 -mt-7 md:-mx-10 md:-mt-10",
                      key === "applications" && "-mx-7 md:mx-0",
                      key === "crm" &&
                        "order-last -mr-7 -mb-7 md:-mr-10 md:-mb-10",
                      key === "assistant" && "order-last mt-auto",
                    )}
                  >
                    <Preview kind={key} />
                  </div>
                  <div className={cn("relative", key !== "crm" && key !== "assistant" && "mt-auto")}>
                    <h3 data-scroll-reveal="text" className="text-xl leading-snug font-black tracking-[-0.025em] [word-break:keep-all] sm:text-2xl">
                      {t(`${key}.title`)}
                    </h3>
                    <p data-scroll-reveal="text" className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground [word-break:keep-all]">
                      {t(`${key}.description`)}
                    </p>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
