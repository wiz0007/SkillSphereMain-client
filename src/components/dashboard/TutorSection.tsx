import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../dashboard/Dashboard.module.scss";
import {
  getMyCourses,
  deleteCourse,
  type Course,
} from "../../services/courses.service";
import TutorCourseCard from "../tutorCourseCard/TutorCourseCard";
import { useAuth } from "../../context/AuthContext";

interface TutorSectionProps {
  summary: {
    courseCount: number;
    pendingRequests: number;
    averageRating: number;
  };
}

const TutorSection = ({ summary }: TutorSectionProps) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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
    if (authLoading || !user?.isTutor) return;
    fetchCourses();
  }, [user, authLoading]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddCourse = () => {
    navigate("/add-course");
  };

  const handleEdit = (course: Course) => {
    navigate(`/add-course/${course._id}`, {
      state: course,
    });
  };

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

  return (
    <div className={styles.tutorSection}>
      <div className={styles.sectionTitleRow}>
        <div>
          <h2>Your Courses</h2>
          <p className={styles.sectionSubtitle}>
            Manage your catalogue, respond to demand, and keep your offers fresh.
          </p>
        </div>

        <div className={styles.tutorHighlights}>
          <span>{summary.courseCount} courses</span>
          <span>{summary.pendingRequests} pending</span>
          <span>
            {summary.averageRating ? `${summary.averageRating}★ avg` : "New tutor"}
          </span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <button className={styles.addBtn} onClick={handleAddCourse}>
          + Add Course
        </button>

        {selected.length > 0 ? (
          <button className={styles.bulkDelete} onClick={handleBulkDelete}>
            Delete Selected ({selected.length})
          </button>
        ) : null}
      </div>

      <div className={styles.panel}>
        {loading ? (
          <p>Loading courses...</p>
        ) : courses.length === 0 ? (
          <div className={styles.emptyState}>
            <strong>No courses yet</strong>
            <span>
              Create your first course to start accepting student requests.
            </span>
          </div>
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
