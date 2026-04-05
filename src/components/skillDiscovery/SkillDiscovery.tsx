import React, { useEffect, useMemo, useState } from "react";
import styles from "./SkillDiscovery.module.scss";
import CourseCard from "../courseCard/CourseCard";
import { getAllCourses, type Course } from "../../services/courses.service";

const SkillDiscovery: React.FC = () => {
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

    fetchCourses();
  }, []);

  // Extract unique categories dynamically
  const categories = useMemo(() => {
    const set = new Set(courses.map((c) => c.category));
    return Array.from(set);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    if (search) {
      result = result.filter((course) =>
        course.title.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (category) {
      result = result.filter((course) => course.category === category);
    }

    if (level) {
      result = result.filter((course) => course.level === level);
    }

    return result;
  }, [courses, search, category, level]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2>Explore Courses</h2>

        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {/* Loading */}
      {loading ? (
        <div className={styles.loading}>Loading courses...</div>
      ) : filteredCourses.length === 0 ? (
        <div className={styles.empty}>No courses found</div>
      ) : (
        <div className={styles.grid}>
          {filteredCourses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillDiscovery;
