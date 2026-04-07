import { useEffect, useState } from "react";
import {
  saveCourse,
  unsaveCourse,
  getSavedCourses,
} from "../../services/courses.service";

export const useSaveCourse = () => {
  const [savedCourses, setSavedCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const data = await getSavedCourses();
        setSavedCourses(data.map((c: any) => c._id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, []);

  const isSaved = (id: string) => savedCourses.includes(id);

  const handleSave = async (courseId: string) => {
  const alreadySaved = savedCourses.includes(courseId);

  try {
    // ✅ Optimistic update FIRST
    if (alreadySaved) {
      setSavedCourses((prev) =>
        prev.filter((id) => id !== courseId)
      );
      await unsaveCourse(courseId);
    } else {
      setSavedCourses((prev) => [...prev, courseId]);
      await saveCourse(courseId);
    }
  } catch (err) {
    console.error(err);

    // ❗ rollback if API fails
    setSavedCourses((prev) =>
      alreadySaved
        ? [...prev, courseId]
        : prev.filter((id) => id !== courseId)
    );
  }
};

  return { isSaved, handleSave, loading };
};