import { useEffect, useState } from "react";
import styles from "../dashboard/Dashboard.module.scss";

import {
  getMyCourses,
  createCourse,
  deleteCourse,
} from "../../services/courses.service";

import CourseCard from "../courseCard/CourseCard";
import AddCourse from "../../features/addCourse/AddCourse";

const TutorSection = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  const fetchCourses = async () => {
    try {
      const data = await getMyCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch {
      setCourses([]);
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

  /* ================= CREATE ================= */
  const handleSave = async (data: any) => {
    await createCourse(data);
    setShowModal(false);
    fetchCourses();
  };

  /* ================= SINGLE DELETE ================= */
  const handleDelete = async (id: string) => {
    await deleteCourse(id);
    fetchCourses();
  };

  /* ================= BULK DELETE ================= */
  const handleBulkDelete = async () => {
    if (!selected.length) return;

    if (!confirm("Delete selected courses?")) return;

    await Promise.all(selected.map((id) => deleteCourse(id)));

    setSelected([]);
    fetchCourses();
  };

  return (
    <div className={styles.tutorSection}>
      <h2>🧑‍🏫 Your Courses</h2>

      {/* ACTION BAR */}
      <div className={styles.toolbar}>
        <button onClick={() => setShowModal(true)}>
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

      {showModal && (
        <AddCourse
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      <div className={styles.panel}>
        {courses.length === 0 ? (
          <p>No courses yet</p>
        ) : (
          <div className={styles.grid}>
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                mode="tutor"
                selectable
                selected={selected.includes(course._id)}
                onSelect={toggleSelect}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorSection;
