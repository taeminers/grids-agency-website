import Image from "next/image";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { Link2, Plug, Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import BrandLogo from "./brand-logo";
import FallbackAvatar from "./fallback-avatar";
import { useReducedMotionPreference } from "./coin-preview/use-reduced-motion";
import { WebGLGuard } from "./coin-preview/webgl-guard";
import styles from "./growth-preview.module.css";

const CobaltLouvre = dynamic(() => import("./originkit/ui/cobalt-louvre"), { ssr: false });

const tools = [
  { key: "analytics", name: "Google Analytics", icon: "/icons/integrations/google-analytics.svg" },
  { key: "ads", name: "Google Ads", icon: "/icons/integrations/google-ads.svg" },
  { key: "seo", name: "SEO", icon: null },
] as const;

export default function GrowthPreview() {
  const t = useTranslations("HomeOfferings.growth.visual");
  const reduced = useReducedMotionPreference();
  const visualRef = useRef<HTMLDivElement>(null);
  const visible = useInView(visualRef, { once: true, margin: "400px 0px" });

  return (
    <div ref={visualRef} className={styles.visual}>
      <div className={styles.backdrop} aria-hidden="true">
        {visible && !reduced && (
          <WebGLGuard>
            <CobaltLouvre background="#171819" glowColor="#ffffff" pointerReactive={false} />
          </WebGLGuard>
        )}
      </div>
      <div className={styles.stack}>
        <div className={styles.connection} aria-hidden="true">
          <div className={styles.endpoint}><BrandLogo className={styles.logo} /></div>
          <span className={styles.line} />
          <span className={styles.junction}><Link2 size={15} strokeWidth={1.5} /></span>
          <span className={styles.line} />
          <div className={styles.endpoint}>
            <FallbackAvatar name="GRIDS Growth" size={28} animated={true} className={styles.avatar} />
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeading}>
            <Plug size={16} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className={styles.title}>{t("title")}</p>
              <p className={styles.subtitle}>{t("subtitle")}</p>
            </div>
          </div>
          <ul className={styles.tools}>
            {tools.map((tool) => (
              <li key={tool.key} className={styles.tool}>
                <span className={`${styles.toolIcon} ${tool.key === "seo" ? styles.seoIcon : ""}`} aria-hidden="true">
                  {tool.icon ? <Image src={tool.icon} alt="" width={24} height={24} /> : <Search size={23} strokeWidth={1.75} />}
                </span>
                <div className={styles.toolCopy}>
                  <p className={styles.toolName}>{tool.name}</p>
                  <p className={styles.toolDescription}>{t(tool.key)}</p>
                </div>
                <span className={styles.addIcon} aria-hidden="true">
                  <Plus size={13} strokeWidth={1.5} />
                </span>
              </li>
            ))}
          </ul>
          <p className={styles.more}>{t("more")}</p>
        </div>
      </div>
    </div>
  );
}
