import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "../dashboard/Dashboard.module.scss";

import {
  getMyCourses,
  deleteCourse,
  type Course,
} from "../../services/courses.service";

import TutorCourseCard from "../tutorCourseCard/TutorCourseCard";

/* ================= TYPES ================= */
// interface Course {
//   _id: string;
//   title: string;
//   description: string;
//   category: string;
//   level: string;
//   price: number;
// }

/* ================= COMPONENT ================= */
const TutorSection = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getMyCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  /* ================= SELECT ================= */
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  /* ================= ADD ================= */
  const handleAddCourse = () => {
    navigate("/add-course");
  };

  /* ================= EDIT ================= */
  const handleEdit = (course: Course) => {
    navigate(`/add-course/${course._id}`, {
      state: course, // prefill form
    });
  };

  /* ================= DELETE SINGLE ================= */
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmDelete) return;

    try {
      await deleteCourse(id);
      fetchCourses();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  /* ================= BULK DELETE ================= */
  const handleBulkDelete = async () => {
    if (!selected.length) return;

    const confirmDelete = window.confirm(
      `Delete ${selected.length} selected courses?`
    );

    if (!confirmDelete) return;

    try {
      await Promise.all(selected.map((id) => deleteCourse(id)));
      setSelected([]);
      fetchCourses();
    } catch (err) {
      console.error("Bulk delete error:", err);
    }
  };

  /* ================= UI ================= */
  return (
    <div className={styles.tutorSection}>
      <h2>🧑‍🏫 Your Courses</h2>

      {/* ACTION BAR */}
      <div className={styles.toolbar}>
        <button
          className={styles.addBtn}
          onClick={handleAddCourse}
        >
          + Add Course
        </button>

        {selected.length > 0 && (
          <button
            className={styles.bulkDelete}
            onClick={handleBulkDelete}
          >
            Delete Selected ({selected.length})
          </button>
        )}
      </div>

      {/* CONTENT */}
      <div className={styles.panel}>
        {loading ? (
          <p>Loading courses...</p>
        ) : courses.length === 0 ? (
          <p>No courses yet</p>
        ) : (
          <div className={styles.grid}>
            {courses.map((course) => (
              <TutorCourseCard
                key={course._id}
                course={course}
                selectable
                selected={selected.includes(course._id)}
                onSelect={toggleSelect}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorSection;
