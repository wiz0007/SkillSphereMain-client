import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SavedCourses.module.scss";
import {
  getSavedCourses,
  type Course,
} from "../../services/courses.service";
import CourseCard from "../courseCard/CourseCard";
import { useAuth } from "../../context/AuthContext";

const SavedCourses = () => {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?._id) return;

    const fetchSaved = async () => {
      try {
        const data = await getSavedCourses();
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch saved courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [user]);

  if (authLoading || !user) {
    return <p className={styles.state}>Loading...</p>;
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>Saved</span>
          <h2>Your saved courses</h2>
          <p>
            Everything you bookmarked for later comparison or
            booking.
          </p>
        </div>

        <div className={styles.snapshot}>
          <span className={styles.snapshotLabel}>Collection</span>
          <strong>{courses.length} saved items</strong>
          <span className={styles.snapshotHint}>
            Curate your shortlist before you request sessions.
          </span>
        </div>
      </div>

      {loading ? <p className={styles.state}>Loading...</p> : null}

      {!loading && courses.length === 0 ? (
        <div className={styles.emptyBox}>
          <h3>No saved courses yet</h3>
          <p>Start exploring and save courses to see them here.</p>

          <button
            type="button"
            className={styles.exploreBtn}
            onClick={() => navigate("/explore")}
          >
            Explore courses
          </button>
        </div>
      ) : null}

      <div className={styles.grid}>
        {courses.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </section>
  );
};

export default SavedCourses;
