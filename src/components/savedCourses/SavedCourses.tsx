import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SavedCourses.module.scss";
import { getSavedCourses } from "../../services/courses.service";
import CourseCard from "../courseCard/CourseCard";
import { useAuth } from "../../context/AuthContext";

/* ================= TYPES ================= */

interface Course {
  _id: string;
  title: string;
  thumbnail?: string;
  instructor?: {
    name: string;
  };
  price?: number;
}

/* ================= COMPONENT ================= */

const SavedCourses = () => {
  const { user, loading: authLoading } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user?._id) return; // ✅ wait for auth

    const fetchSaved = async () => {
      try {
        const data = await getSavedCourses();
        setCourses(data);
      } catch (err) {
        console.error("Failed to fetch saved courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [user]);

  // ⛔ block until auth ready
  if (authLoading || !user) {
    return <p className={styles.state}>Loading...</p>;
  }

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <h2>❤️ Saved Courses</h2>
        <p>Your bookmarked learning content</p>
      </div>

      {/* LOADING */}
      {loading && <p className={styles.state}>Loading...</p>}

      {/* EMPTY STATE */}
      {!loading && courses.length === 0 && (
        <div className={styles.emptyBox}>
          <h3>No saved courses yet</h3>
          <p>Start exploring and save courses to see them here.</p>

          <button
            className={styles.exploreBtn}
            onClick={() => navigate("/discover")}
          >
            Explore Courses
          </button>
        </div>
      )}

      {/* COURSES */}
      <div className={styles.grid}>
        {courses.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default SavedCourses;