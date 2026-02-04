import VisionCanvas from "@/components/vision-canvas";
import VisionContent from "@/components/vision/vision-content";

export default function VisionPage() {
    return (
        <div className="w-full min-h-screen pt-20 bg-background">
            {/* Hero / Vision Canvas Section */}
            <section className="relative w-full flex flex-col items-center justify-center">
                <div className="absolute inset-0 z-0">
                     <VisionCanvas />
                </div>
                <VisionContent />
            </section>
        </div>
    );
}