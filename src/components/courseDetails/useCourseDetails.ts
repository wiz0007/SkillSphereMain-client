import { useEffect, useState } from "react";
import {
  addReview,
  approveRecordedCourseAccess,
  getCourseById,
  rateCourse,
  rejectRecordedCourseAccess,
  requestRecordedCourseAccess,
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
  const [recordedActionLoading, setRecordedActionLoading] = useState("");
  const [recordedError, setRecordedError] = useState("");

  const loadCourse = async () => {
    if (!id) {
      return;
    }

    setLoading(true);

    try {
      const data = await getCourseById(id);
      setCourse(data);

      const currentUserReview = data.reviews?.find((review: any) => {
        const reviewUserId =
          review.user?._id?.toString?.() ||
          review.user?.toString?.() ||
          "";

        return (
          reviewUserId &&
          reviewUserId ===
            JSON.parse(localStorage.getItem("user") || "null")?._id
        );
      });

      if (currentUserReview) {
        setReviewRating(currentUserReview.rating || 0);
        setReviewText(currentUserReview.comment || "");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCourse();
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
      }));

      setError("");
    } catch {
      setError("Failed to submit");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRecordedPurchaseRequest = async () => {
    if (!id) {
      return;
    }

    try {
      setRecordedError("");
      setRecordedActionLoading("purchase");
      await requestRecordedCourseAccess(id);
      await loadCourse();
    } catch (nextError: any) {
      setRecordedError(nextError?.message || "Failed to request unlock");
    } finally {
      setRecordedActionLoading("");
    }
  };

  const handleApproveRecordedRequest = async (accessId: string) => {
    try {
      setRecordedError("");
      setRecordedActionLoading(`approve:${accessId}`);
      await approveRecordedCourseAccess(accessId);
      await loadCourse();
    } catch (nextError: any) {
      setRecordedError(nextError?.message || "Failed to approve unlock");
    } finally {
      setRecordedActionLoading("");
    }
  };

  const handleRejectRecordedRequest = async (accessId: string) => {
    try {
      setRecordedError("");
      setRecordedActionLoading(`reject:${accessId}`);
      await rejectRecordedCourseAccess(accessId);
      await loadCourse();
    } catch (nextError: any) {
      setRecordedError(nextError?.message || "Failed to reject unlock");
    } finally {
      setRecordedActionLoading("");
    }
  };

  return {
    course,
    loading,
    loadCourse,

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

    recordedActionLoading,
    recordedError,
    handleRecordedPurchaseRequest,
    handleApproveRecordedRequest,
    handleRejectRecordedRequest,
  };
};
