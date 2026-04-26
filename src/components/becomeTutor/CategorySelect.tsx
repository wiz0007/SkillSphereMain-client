import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import styles from "./CategorySelect.module.scss";

interface Props {
  value: string[];
  onChange: (categories: string[]) => void;
}

const CATEGORY_OPTIONS = [
  "Web Development",
  "Mobile Development",
  "Management",
  "Data Science",
  "Machine Learning",
  "AI",
  "Cloud Computing",
  "DevOps",
  "Cybersecurity",
  "UI/UX Design",
  "Blockchain",
  "Game Development",
  "Programming Basics",
  "Others"
];

const CategorySelect: React.FC<Props> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = CATEGORY_OPTIONS.filter((category) =>
    category.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCategory = (category: string) => {
    if (value.includes(category)) {
      onChange(value.filter((item) => item !== category));
    } else {
      onChange([...value, category]);
    }
  };

  const removeCategory = (category: string) => {
    onChange(value.filter((item) => item !== category));
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((previous) =>
        previous < filtered.length - 1 ? previous + 1 : previous
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((previous) =>
        previous > 0 ? previous - 1 : previous
      );
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const selected = filtered[highlightIndex];
      if (selected) toggleCategory(selected);
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div
        className={styles.selector}
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        <div className={styles.tags}>
          {value.map((category) => (
            <span key={category} className={styles.tag}>
              {category}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  removeCategory(category);
                }}
              >
                <X size={12} />
              </button>
            </span>
          ))}

          <input
            ref={inputRef}
            value={search}
            placeholder={
              value.length === 0 ? "Search categories..." : ""
            }
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div
          className={`${styles.chevron} ${
            open ? styles.rotate : ""
          }`}
        >
          <ChevronDown size={16} />
        </div>
      </div>

      {open ? (
        <div className={styles.dropdown}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>No results</div>
          ) : null}

          {filtered.map((category, index) => (
            <button
              key={category}
              type="button"
              className={`${styles.option}
                ${value.includes(category) ? styles.active : ""}
                ${index === highlightIndex ? styles.highlight : ""}
              `}
              onClick={() => toggleCategory(category)}
            >
              <span>{category}</span>
              {value.includes(category) ? (
                <span className={styles.check}>
                  <Check size={14} />
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default CategorySelect;
