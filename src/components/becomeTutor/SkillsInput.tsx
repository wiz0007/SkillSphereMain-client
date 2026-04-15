import React, { useState } from "react";
import styles from "./SkillsInput.module.scss";

interface Props {
  value: string[];
  onChange: (skills: string[]) => void;
}

const SUGGESTIONS = [
  "React",
  "Node.js",
  "Python",
  "Java",
  "MongoDB",
  "AWS",
  "Docker",
  "System Design",
  "DSA",
  "Machine Learning",
  "Next.js",
  "TypeScript",
];

const SkillsInput: React.FC<Props> = ({ value, onChange }) => {
  const [input, setInput] = useState("");
  const [filtered, setFiltered] = useState<string[]>([]);

  const addSkill = (skill: string) => {
    if (!skill || value.includes(skill)) return;
    onChange([...value, skill]);
    setInput("");
    setFiltered([]);
  };

  const removeSkill = (skill: string) => {
    onChange(value.filter((s) => s !== skill));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    if (val.trim()) {
      const results = SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(val.toLowerCase())
      );
      setFiltered(results);
    } else {
      setFiltered([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      addSkill(input.trim());
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.tags}>
        {value.map((skill) => (
          <span key={skill} className={styles.tag}>
            {skill}
            <button onClick={() => removeSkill(skill)}>×</button>
          </span>
        ))}

        <input
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type and press Enter..."
        />
      </div>

      {filtered.length > 0 && (
        <div className={styles.dropdown}>
          {filtered.map((s) => (
            <div key={s} onClick={() => addSkill(s)}>
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillsInput;