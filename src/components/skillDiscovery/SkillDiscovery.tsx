import React, { useMemo, useState } from "react";
import styles from "./SkillDiscovery.module.scss";
import SkillCard from "../skillCard/SkillCard";
import SkillFilters from "./SkillFilters";
import { skills } from "./skillData";

const SkillDiscovery: React.FC = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState("rating");

  const filteredSkills = useMemo(() => {
    let result = [...skills];

    if (search) {
      result = result.filter((skill) =>
        skill.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      result = result.filter((skill) => skill.category === category);
    }

    if (level) {
      result = result.filter((skill) => skill.level === level);
    }

    if (sort === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    if (sort === "sessions") {
      result.sort((a, b) => b.sessions - a.sessions);
    }

    return result;
  }, [search, category, level, sort]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Discover Skills</h2>

        <input
          type="text"
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <SkillFilters
        category={category}
        setCategory={setCategory}
        level={level}
        setLevel={setLevel}
        sort={sort}
        setSort={setSort}
      />

      {filteredSkills.length === 0 ? (
        <div className={styles.empty}>
          <p>No skills found</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredSkills.map((skill) => (
            <SkillCard key={skill.id} {...skill} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillDiscovery;