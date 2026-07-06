import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import styles from "./SkillDiscovery.module.scss";
import CourseCard from "../courseCard/CourseCard";
import { getAllCourses, type Course } from "../../services/courses.service";
import { useAuth } from "../../context/AuthContext";
import { trackSeoEvent } from "../../seo/analytics";

const SkillDiscovery = () => {
  const { user, loading: authLoading } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getAllCourses();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchCourses();
  }, []);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        courses
          .map((c) => c.category)
          .filter((cat): cat is string => Boolean(cat))
      )
    );
  }, [courses]);

  const featuredCategories = useMemo(() => categories.slice(0, 4), [categories]);

  const filteredCourses = useMemo(() => {
    let result = [...courses];
    const query = search.trim().toLowerCase();

    if (user?._id) {
      result = result.filter(
        (course) => String(course.tutor?._id) !== String(user._id),
      );
    }

    if (query) {
      result = result.filter((course) => {
        const searchable = [
          course.title,
          course.description,
          course.type,
          course.category,
          course.level,
          course.tutor?.username,
          course.tutor?.fullName,
          ...(Array.isArray(course.skills) ? course.skills : []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      });
    }

    if (category) {
      result = result.filter((course) => course.category === category);
    }

    if (level) {
      result = result.filter((course) => course.level === level);
    }

    return result;
  }, [courses, search, category, level, user]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <section className={styles.searchPanel} aria-label="Course search">
          <div className={styles.searchPanelHeader}>
            <span>Skill match desk</span>
            <strong>{filteredCourses.length} matches</strong>
          </div>

          <label className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <span className={styles.searchLabel}>Search</span>
            <input
              type="search"
              placeholder="Search a skill, tutor, level, or course type"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value.trim().length >= 3) {
                  trackSeoEvent("search_courses", {
                    query_length: e.target.value.trim().length,
                  });
                }
              }}
            />
            {search ? (
              <button
                type="button"
                className={styles.clearSearch}
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <FiX />
              </button>
            ) : null}
          </label>

          {featuredCategories.length ? (
            <div className={styles.quickPicks} aria-label="Quick categories">
              {featuredCategories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  className={category === cat ? styles.quickPickActive : ""}
                  onClick={() => {
                    setCategory((current) => current === cat ? "" : cat);
                    trackSeoEvent("apply_filter", {
                      filter_type: "category",
                    });
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          ) : null}
        </section>
      </div>

      {/* FILTERS */}
      <div className={styles.filters}>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            trackSeoEvent("apply_filter", {
              filter_type: "category",
            });
          }}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={level}
          onChange={(e) => {
            setLevel(e.target.value);
            trackSeoEvent("apply_filter", {
              filter_type: "level",
            });
          }}
        >
          <option value="">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {/* CONTENT */}
      {loading || authLoading ? (
        <div className={styles.loading}>Loading skills...</div>
      ) : filteredCourses.length === 0 ? (
        <div className={styles.empty}>
          No courses match these filters right now.
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredCourses.map((course, index) => (
            <div
              key={course._id}
              className={styles.cardWrapper}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillDiscovery;


