import React from "react";
import styles from "./SkillCard.module.scss";
import { FiStar, FiUsers } from "react-icons/fi";

export interface SkillCardProps {
  id: number;
  title: string;
  teacher: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  sessions: number;
  image: string;
}

const SkillCard: React.FC<SkillCardProps> = ({
  title,
  teacher,
  category,
  level,
  rating,
  sessions,
  image,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={image} alt={title} />
        <span className={styles.category}>{category}</span>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>

        <p className={styles.teacher}>by {teacher}</p>

        <div className={styles.meta}>
          <span className={styles.level}>{level}</span>

          <div className={styles.stats}>
            <span>
              <FiStar /> {rating}
            </span>

            <span>
              <FiUsers /> {sessions}
            </span>
          </div>
        </div>

        <button className={styles.button}>
          Request Session
        </button>
      </div>
    </div>
  );
};

export default SkillCard;