import React from "react";
import styles from "./SkillFilters.module.scss";

interface Props {
  category: string;
  setCategory: (value: string) => void;
  level: string;
  setLevel: (value: string) => void;
  sort: string;
  setSort: (value: string) => void;
}

const SkillFilters: React.FC<Props> = ({
  category,
  setCategory,
  level,
  setLevel,
  sort,
  setSort
}) => {
  return (
    <div className={styles.filters}>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        <option value="Programming">Programming</option>
        <option value="Design">Design</option>
        <option value="Marketing">Marketing</option>
      </select>

      <select value={level} onChange={(e) => setLevel(e.target.value)}>
        <option value="">All Levels</option>
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
      </select>

      <select value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="rating">Top Rated</option>
        <option value="sessions">Most Sessions</option>
      </select>
    </div>
  );
};

export default SkillFilters;