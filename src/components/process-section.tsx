"use client";

import { Calendar, Code, FileText, User, Clock } from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";

export default function ProcessSection() {
  const t = useTranslations("Process");

  const timelineData = [
    {
      id: 1,
      title: t("Timeline.Items.planning.title"),
      deliverable: t("Timeline.Items.planning.deliverable"),
      content: t("Timeline.Items.planning.content"),
      category: t("Timeline.Items.planning.title"),
      icon: Calendar,
      relatedIds: [2],
      status: "completed" as const,
      intensity: 90,
    },
    {
      id: 2,
      title: t("Timeline.Items.design.title"),
      deliverable: t("Timeline.Items.design.deliverable"),
      content: t("Timeline.Items.design.content"),
      category: t("Timeline.Items.design.title"),
      icon: FileText,
      relatedIds: [1, 3],
      status: "completed" as const,
      intensity: 60,
    },
    {
      id: 3,
      title: t("Timeline.Items.development.title"),
      deliverable: t("Timeline.Items.development.deliverable"),
      content: t("Timeline.Items.development.content"),
      category: t("Timeline.Items.development.title"),
      icon: Code,
      relatedIds: [2, 4],
      status: "in-progress" as const,
      intensity: 10,
    },
    {
      id: 4,
      title: t("Timeline.Items.testing.title"),
      deliverable: t("Timeline.Items.testing.deliverable"),
      content: t("Timeline.Items.testing.content"),
      category: t("Timeline.Items.testing.title"),
      icon: User,
      relatedIds: [3, 5],
      status: "pending" as const,
      intensity: 50,
    },
    {
      id: 5,
      title: t("Timeline.Items.release.title"),
      deliverable: t("Timeline.Items.release.deliverable"),
      content: t("Timeline.Items.release.content"),
      category: t("Timeline.Items.release.title"),
      icon: Clock,
      relatedIds: [4],
      status: "pending" as const,
      intensity: 10,
    },
  ];

  return (
    <section className="relative w-full py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Descriptive Text */}
          <div className="max-w-xl">
            <div className="h-12 flex flex-col justify-end items-start mb-2">
              <span className="text-sm font-mono text-tertiary tracking-wider uppercase">
                {t("label")}
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">
              {t("title")}
            </h2>
            
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              {t("description")}
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-1 h-auto bg-tertiary/30 rounded-full" />
                <div>
                  <h4 className="font-medium mb-1">
                    {t("Features.collaborative.title")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("Features.collaborative.description")}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1 h-auto bg-tertiary/30 rounded-full" />
                <div>
                  <h4 className="font-medium mb-1">
                    {t("Features.execution.title")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("Features.execution.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Orbital Timeline in Card */}
          <div className="relative group">
            <div className="absolute -inset-px bg-gradient-to-tr from-tertiary/20 via-transparent to-tertiary/10 rounded-[2rem] blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
            <Card className="relative bg-background/50 backdrop-blur-xl border-border/50 rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-tertiary/20 to-transparent" />
              <CardContent className="p-0">
                <RadialOrbitalTimeline timelineData={timelineData} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
