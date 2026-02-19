import VisionContent from "@/components/vision/vision-content";
import VisionPageClient from "@/components/vision/vision-page-client";

export default function VisionPage() {
    return (
        <VisionPageClient>
            <VisionContent />
        </VisionPageClient>
    );
}