import React, { useState, useRef, useEffect } from "react";
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
];

const CategorySelect: React.FC<Props> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ================= CLOSE ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= FILTER ================= */
  const filtered = CATEGORY_OPTIONS.filter((cat) =>
    cat.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= ACTIONS ================= */

  const toggleCategory = (category: string) => {
    if (value.includes(category)) {
      onChange(value.filter((c) => c !== category));
    } else {
      onChange([...value, category]);
    }
  };

  const removeCategory = (category: string) => {
    onChange(value.filter((c) => c !== category));
  };

  /* ================= KEYBOARD ================= */

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < filtered.length - 1 ? prev + 1 : prev
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : prev
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const selected = filtered[highlightIndex];
      if (selected) toggleCategory(selected);
    }

    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {/* SELECT BOX */}
      <div
        className={styles.selector}
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        {/* TAGS */}
        <div className={styles.tags}>
          {value.map((cat) => (
            <span key={cat} className={styles.tag}>
              {cat}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeCategory(cat);
                }}
              >
                ×
              </button>
            </span>
          ))}

          {/* SEARCH INPUT */}
          <input
            ref={inputRef}
            value={search}
            placeholder={value.length === 0 ? "Search categories..." : ""}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* CHEVRON */}
        <div
          className={`${styles.chevron} ${
            open ? styles.rotate : ""
          }`}
        >
          ▼
        </div>
      </div>

      {/* DROPDOWN */}
      {open && (
        <div className={styles.dropdown}>
          {filtered.length === 0 && (
            <div className={styles.empty}>No results</div>
          )}

          {filtered.map((cat, index) => (
            <div
              key={cat}
              className={`${styles.option} 
                ${value.includes(cat) ? styles.active : ""}
                ${index === highlightIndex ? styles.highlight : ""}
              `}
              onClick={() => toggleCategory(cat)}
            >
              <span>{cat}</span>

              {value.includes(cat) && (
                <span className={styles.check}>✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategorySelect;