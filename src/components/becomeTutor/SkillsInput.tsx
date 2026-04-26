import React, { useState } from "react";
import { X } from "lucide-react";
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
  const trimmedInput = input.trim();

  const addSkill = (skill: string) => {
    if (!skill || value.includes(skill)) return;
    onChange([...value, skill]);
    setInput("");
    setFiltered([]);
  };

  const removeSkill = (skill: string) => {
    onChange(value.filter((item) => item !== skill));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setInput(nextValue);

    if (nextValue.trim()) {
      const results = SUGGESTIONS.filter((skill) =>
        skill.toLowerCase().includes(nextValue.toLowerCase())
      );
      setFiltered(results);
    } else {
      setFiltered([]);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter" && input.trim()) {
      event.preventDefault();
      addSkill(input.trim());
    }
  };

  const handleAddClick = () => {
    if (!trimmedInput) return;
    addSkill(trimmedInput);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.tags}>
        {value.map((skill) => (
          <span key={skill} className={styles.tag}>
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
            >
              <X size={12} />
            </button>
          </span>
        ))}

        <div className={styles.composer}>
          <input
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a skill"
          />

          <button
            type="button"
            className={styles.addButton}
            onClick={handleAddClick}
            disabled={!trimmedInput}
          >
            Add
          </button>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className={styles.dropdown}>
          {filtered.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => addSkill(skill)}
            >
              {skill}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default SkillsInput;
