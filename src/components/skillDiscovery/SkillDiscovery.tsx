import React, { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import styles from "./SkillDiscovery.module.scss";
import CourseCard from "../courseCard/CourseCard";
import { getAllCourses, type Course } from "../../services/courses.service";
import { useAuth } from "../../context/AuthContext";

const SkillDiscovery: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");

  useEffect(() => {
    if (authLoading || !user?._id) return;

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

    fetchCourses();
  }, [user, authLoading]);

  const categories = useMemo(() => {
    return Array.from(new Set(courses.map((c) => c.category).filter(Boolean)));
  }, [courses]);

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    if (!user?._id) return result;

    result = result.filter(
      (course) => String(course.tutor?._id) !== String(user._id),
    );

    if (search) {
      result = result.filter((course) =>
        (course.title || "").toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (category) {
      result = result.filter((course) => course.category === category);
    }

    if (level) {
      result = result.filter((course) => course.level === level);
    }

    return result;
  }, [courses, search, category, level, user]);

  if (authLoading || !user) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h2>Explore Skills</h2>
          <p>Find people to learn from and swap skills</p>
        </div>

        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* FILTERS */}
      <div className={styles.filters}>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className={styles.loading}>Loading skills...</div>
      ) : filteredCourses.length === 0 ? (
        <div className={styles.empty}>No skills found</div>
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