import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, Check, CheckCheck, ClipboardCheck, FileCheck2, Link2, LoaderCircle, MessageSquare, Send, Sparkles, UserRound } from "lucide-react";
import type { useInquirySimulation } from "./use-inquiry-simulation";
import styles from "./inquiry-automation.module.css";
import SourceConnections from "./source-connections";

type Simulation = ReturnType<typeof useInquirySimulation>;

export default function Workflow({ simulation, reduced, onRetry }: {
  simulation: Simulation; reduced: boolean; onRetry: () => void;
}) {
  const t = useTranslations("Pricing.automationDemo");
  const { result, completed, sourcesRead, running, error } = simulation;
  const reveal = { initial: { opacity: 0, y: reduced ? 0 : 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: reduced ? .1 : .65 } };
  const gathering = completed === 1 && result && sourcesRead < result.sources.length;
  const activeLabel = gathering ? result.sources[sourcesRead].action : t(`workflow.stages.${Math.min(completed, 5)}`);
  const inputs = result ? [t("workflow.inquiryInput"), ...result.sources.map(source => source.name)] : [];

  return <>
    <div className={styles.panelHeading}><span><Sparkles size={17} aria-hidden="true" />{t("workflow.title")}</span><span>{t("sources.demo")}</span></div>
    <div className={styles.progressTrack} role="progressbar" aria-label={t("progress")} aria-valuemin={0} aria-valuemax={5} aria-valuenow={completed}>
      <motion.div initial={false} animate={{ scaleX: completed / 5 }} transition={{ duration: reduced ? 0 : .6 }} />
    </div>
    {error ? <div className={styles.emptyState}><p>{t("error")}</p><button type="button" onClick={onRetry}>{t("retry")}</button></div> : <>
      <div className={styles.flowGrid} data-phase={completed} data-running={running}>
        <section className={styles.evidenceRail} aria-label={t("workflow.collected")}>
          <h5 className={styles.columnTitle}><span>01</span>{t("workflow.collected")}</h5>
          {result && completed >= 1 ? <motion.div {...reveal}>
            {result.mode === "custom" && <p className={styles.customBadge}>{t("customResult")}</p>}
            <div className={styles.inquiryEvidence}>
              <span><FileCheck2 size={15} aria-hidden="true" />{t("analysisLabel")}</span>
              <h6>{result.category}</h6><p>{result.intent}</p>
              <dl className={styles.fields}>{result.fields.map(field => <div key={field.label}><dt>{field.label}</dt><dd>{field.value}</dd></div>)}</dl>
            </div>
          </motion.div> : <p className={styles.waitingCopy}>{t("workflow.inputWaiting")}</p>}
          {result && sourcesRead > 0 && <motion.div {...reveal}>
            <SourceConnections sources={result.sources.slice(0, sourcesRead)} sourcesRead={sourcesRead} />
          </motion.div>}
        </section>

        <section className={styles.processingHub} aria-label={t("workflow.processing")}>
          <div className={styles.hubIcon} data-active={running}>
            {completed === 5 ? <CheckCheck size={25} aria-hidden="true" /> : <Sparkles size={25} aria-hidden="true" />}
          </div>
          <span className={styles.hubEyebrow}>{t("workflow.processing")}</span>
          <h5>{running || completed === 5 ? activeLabel : t("ready")}</h5>
          <ol className={styles.stageList}>
            {Array.from({ length: 5 }, (_, index) => <li key={index} data-active={running && completed === index} data-done={completed > index}>
              {completed > index ? <Check size={13} aria-hidden="true" /> : running && completed === index ? <LoaderCircle size={13} className={styles.spinner} aria-hidden="true" /> : <span className={styles.stageDot} />}
              <span>{t(`workflow.stages.${index}`)}</span>
            </li>)}
          </ol>
          {running && result && <button type="button" className={styles.skipButton} onClick={simulation.finish}>{t("workflow.skip")}<ArrowRight size={12} aria-hidden="true" /></button>}
          <div className={styles.transferLine} data-active={completed === 3} aria-hidden="true"><span /></div>
        </section>

        <section className={styles.responseRail} aria-label={t("workflow.output")}>
          <h5 className={styles.columnTitle}><span>02</span>{t("workflow.output")}</h5>
          {result && completed >= 3 ? <>
            <div className={styles.inputReceipt}>
              <span><Link2 size={13} aria-hidden="true" />{t("sources.replyBasedOn")}</span>
              {inputs.map((name, index) => <motion.div key={name} className={styles.inputChip}
                initial={{ opacity: 0, x: reduced ? 0 : -18 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: reduced ? .1 : .65, delay: reduced ? 0 : index * .55 }}>
                <Check size={12} aria-hidden="true" />{name}
              </motion.div>)}
            </div>
            {completed >= 4 ? <motion.div {...reveal}>
              <div className={styles.draftHeader}><span>{t("replyTo", { name: result.record.customer })}</span><span>{completed === 5 ? t("workflow.sent") : t("workflow.sending")}</span></div>
              <div className={styles.replyBubble}>{result.reply}</div>
              <p className={styles.replyNote}><Send size={14} aria-hidden="true" />{t("workflow.simulatedOnly")}</p>
            </motion.div> : <p className={styles.composing}><LoaderCircle size={15} className={styles.spinner} aria-hidden="true" />{t("workflow.composing")}</p>}
          </> : <div className={styles.outputWaiting}><MessageSquare size={25} strokeWidth={1.3} aria-hidden="true" /><p>{t("workflow.outputWaiting")}</p></div>}
        </section>
      </div>
      <div className={styles.recordsGrid}>
        <section>
          <h5 className={styles.columnTitle}><UserRound size={16} aria-hidden="true" />{t("recordLabel")}</h5>
          {result && completed >= 2 ? <motion.div {...reveal}>
            <dl className={styles.fields}>
              <div><dt>{t("workflow.customer")}</dt><dd>{result.record.customer}</dd></div>
              <div><dt>{t("channel")}</dt><dd>{result.record.channel}</dd></div>
              <div><dt>{t("owner")}</dt><dd>{result.record.owner}</dd></div>
            </dl>
            <p className={styles.footnote}>{t("recordLocal")}</p>
          </motion.div> : <p className={styles.waitingCopy}>{t("workflow.recordWaiting")}</p>}
        </section>
        <section>
          <h5 className={styles.columnTitle}><ClipboardCheck size={16} aria-hidden="true" />{t("tasksLabel")}</h5>
          {result && completed === 5 ? <motion.div {...reveal}>
            <ul className={styles.tasks}>{result.tasks.map((task, index) => <li key={task.title}><span className={styles.taskNumber}>{String(index + 1).padStart(2, "0")}</span><div><h6>{task.title}</h6><p>{task.owner}</p></div><span>{t("todo")}</span></li>)}</ul>
            <div className={styles.confirmation}><ClipboardCheck size={15} aria-hidden="true" /><p><strong>{t("needsConfirmation")}</strong>{result.confirmation}</p></div>
          </motion.div> : <p className={styles.waitingCopy}>{t("workflow.taskWaiting")}</p>}
        </section>
      </div>
    </>}
  </>;
}
