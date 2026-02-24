"use client";

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Calendar, LucideIcon, MapIcon, Star } from 'lucide-react'
import { ReactNode } from 'react'
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline"
import { timelineData } from "@/data/timeline-items"

export function FeaturesGridSection() {
    return (
        <section className="bg-background py-16 md:py-32">
            <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl">
                <div className="mx-auto grid gap-4 lg:grid-cols-2">
                    <FeatureCard>
                        <CardHeader className="pb-3">
                            <CardHeading
                                icon={MapIcon}
                                title="Global Brand Reach"
                                description="Advanced strategic positioning to amplify your message across borders."
                            />
                        </CardHeader>

                        <div className="relative mb-6 border-t border-dashed sm:mb-0 overflow-hidden">
                            <div className="absolute inset-0 [background:radial-gradient(125%_125%_at_50%_0%,transparent_40%,hsl(var(--muted)),white_125%)] dark:opacity-20"></div>
                            <div className="aspect-[16/10] p-1 px-6">
                                <img
                                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
                                    alt="global reach illustration"
                                    className="w-full h-full object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700"
                                />
                            </div>
                        </div>
                    </FeatureCard>

                    <FeatureCard>
                        <CardHeader className="pb-3">
                            <CardHeading
                                icon={Calendar}
                                title="Agile Methodology"
                                description="Streamlined workflows that adapt to your rapid growth and evolution."
                            />
                        </CardHeader>

                        <CardContent>
                            <div className="relative mb-6 sm:mb-0">
                                <div className="absolute -inset-6 [background:radial-gradient(50%_50%_at_75%_50%,transparent,hsl(var(--background))_100%)]"></div>
                                <div className="aspect-[16/10] border border-border/50 overflow-hidden">
                                     <img
                                        src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop"
                                        alt="digital strategy illustration"
                                        className="w-full h-full object-cover brightness-75 dark:brightness-50"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </FeatureCard>

                    <FeatureCard className="p-0 lg:col-span-2 overflow-hidden border-primary/20">
                        <div className="p-8 md:p-12 pb-0">
                             <div className="flex items-center gap-2 text-muted-foreground mb-4">
                                <Star className="size-4 animate-pulse text-tertiary" />
                                <span className="text-xs uppercase tracking-widest font-semibold">Strategic Workflow</span>
                            </div>
                            <h3 className="max-w-md text-3xl font-bold tracking-tight mb-4">Our Interactive Process</h3>
                            <p className="max-w-xl text-muted-foreground text-lg mb-8">
                                Experience a transparent, step-by-step roadmap tailored to your project's unique requirements.
                            </p>
                        </div>

                        <div className="relative w-full h-[600px] border-t border-border/50">
                            <RadialOrbitalTimeline 
                                timelineData={timelineData} 
                                className="bg-transparent"
                            />
                        </div>
                    </FeatureCard>
                </div>
            </div>
        </section>
    )
}

interface FeatureCardProps {
    children: ReactNode
    className?: string
}

function FeatureCard({ children, className }: FeatureCardProps) {
    return (
        <Card className={cn('group relative rounded-none border border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/30', className)}>
            <CardDecorator />
            {children}
        </Card>
    )
}

function CardDecorator() {
    return (
        <>
            <span className="bg-primary/40 absolute -left-px -top-px block size-2 rounded-tl-sm"></span>
            <span className="bg-primary/40 absolute -right-px -top-px block size-2 rounded-tr-sm"></span>
            <span className="bg-primary/40 absolute -bottom-px -left-px block size-2 rounded-bl-sm"></span>
            <span className="bg-primary/40 absolute -bottom-px -right-px block size-2 rounded-br-sm"></span>
        </>
    )
}

interface CardHeadingProps {
    icon: LucideIcon
    title: string
    description: string
}

function CardHeading({ icon: Icon, title, description }: CardHeadingProps) {
    return (
        <div className="p-4">
            <span className="text-muted-foreground flex items-center gap-2 text-xs uppercase tracking-widest font-bold">
                <Icon className="size-3" />
                {title}
            </span>
            <p className="mt-6 text-xl font-semibold tracking-tight">{description}</p>
        </div>
    )
}
