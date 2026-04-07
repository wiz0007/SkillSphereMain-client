import { useEffect, useState } from "react";
import {
  addReview,
  getCourseById,
  rateCourse,
} from "../../services/courses.service";

export const useCourseDetails = (id?: string) => {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [hover, setHover] = useState(0);
  const [userRating, setUserRating] = useState(0);

  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    getCourseById(id).then((data) => {
      setCourse(data);
      setLoading(false);
    });
  }, [id]);

  

  const handleRate = async (value: number) => {
    if (!id) return;

    setUserRating(value);

    const res = await rateCourse(id, value);

    setCourse((prev: any) => ({
      ...prev,
      averageRating: res.averageRating,
      totalRatings: res.totalRatings,
    }));
  };

  const handleReviewSubmit = async () => {
    if (!id || !reviewRating || !reviewText.trim()) {
      setError("Complete rating + review");
      return;
    }

    try {
      setSubmitLoading(true);

      const res = await addReview(id, reviewRating, reviewText);

      setCourse((prev: any) => ({
        ...prev,
        reviews: res.reviews,
        averageRating: res.averageRating,
        totalRatings: res.totalRatings,
        ratings: res.ratings,
      }));

      setReviewText("");
      setReviewRating(0);
      setError("");
    } catch {
      setError("Failed to submit");
    } finally {
      setSubmitLoading(false);
    }
  };

  return {
    course,
    loading,

    hover,
    setHover,
    userRating,
    handleRate,

    reviewText,
    setReviewText,
    reviewRating,
    setReviewRating,
    handleReviewSubmit,
    submitLoading,
    error,
  };
};