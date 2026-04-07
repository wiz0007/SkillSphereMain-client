import { useEffect, useState } from "react";
import styles from "./SavedCourses.module.scss";
import { getSavedCourses } from "../../services/courses.service";
import CourseCard from "../courseCard/CourseCard";

const SavedCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const data = await getSavedCourses();
        setCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, []);

  return (
    <div className={styles.page}>
      <h2>❤️ Saved Courses</h2>

      {loading && <p>Loading...</p>}

      {!loading && courses.length === 0 && (
        <p>No saved courses yet</p>
      )}

      <div className={styles.grid}>
        {courses.map((course: any) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default SavedCourses;