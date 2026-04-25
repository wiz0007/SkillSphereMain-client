import styles from "../dashboard/Dashboard.module.scss";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string;
  meta?: string;
  tone?: "default" | "accent" | "success" | "warning";
}

const toneClassMap: Record<NonNullable<StatsCardProps["tone"]>, string> = {
  default: styles.cardDefault,
  accent: styles.cardAccent,
  success: styles.cardSuccess,
  warning: styles.cardWarning,
};

const StatsCard = ({
  title,
  value,
  meta,
  tone = "default",
}: StatsCardProps) => {
  return (
    <motion.div
      className={`${styles.card} ${toneClassMap[tone]}`}
      whileHover={{ y: -4 }}
    >
      <h3>{title}</h3>
      <p>{value}</p>
      {meta ? <span className={styles.cardMeta}>{meta}</span> : null}
    </motion.div>
  );
};

export default StatsCard;
