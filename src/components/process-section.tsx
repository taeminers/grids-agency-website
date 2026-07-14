"use client";

import { Card, CardContent } from "@/components/ui/card";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import { Calendar, Clock, Code, FileText, User } from "lucide-react";
import { useTranslations } from "next-intl";

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
    <section className="relative w-full py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col w-full mb-16">
          <div className="mb-2">
            <span className="text-sm font-mono text-tertiary tracking-wider uppercase">
              {t("label")}
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-6">
            {t("title")}
          </h2>
          
          <p className="text-muted-foreground text-lg leading-relaxed break-keep">
            {t("description")}
          </p>
        </div>

        {/* Orbital Timeline in Card */}
        <div className="relative group w-full">
          <div className="absolute -inset-px bg-gradient-to-tr from-tertiary/20 via-transparent to-tertiary/10 rounded-[2rem] blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
          <Card className="relative bg-background/50 backdrop-blur-xl border-border/50 rounded-[2rem] overflow-hidden">
            <CardContent className="p-0">
              <RadialOrbitalTimeline timelineData={timelineData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
