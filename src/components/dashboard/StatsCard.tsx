import styles from "../dashboard/Dashboard.module.scss";
import { motion } from "framer-motion";

const StatsCard = ({ title, value }: any) => {
  return (
    <motion.div
      className={styles.card}
      whileHover={{ scale: 1.05 }}
    >
      <h3>{title}</h3>
      <p>{value}</p>
    </motion.div>
  );
};

export default StatsCard;