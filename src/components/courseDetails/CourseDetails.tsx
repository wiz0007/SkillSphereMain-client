import { useParams } from "react-router-dom";
import styles from "./CourseDetails.module.scss";

import CourseHero from "./CourseHero";
import CourseSidebar from "./CourseSidebar";
import ReviewSection from "./ReviewSection";
import { useCourseDetails } from "./useCourseDetails";
import { useSaveCourse } from "./useSaveCourse";

const CourseDetails = () => {
  const { id } = useParams();

  const {
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
  } = useCourseDetails(id);

  const { isSaved, handleSave } = useSaveCourse();

  if (loading || !course) return <div>Loading...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <CourseHero
            course={course}
            hover={hover}
            setHover={setHover}
            userRating={userRating}
            handleRate={handleRate}
            saved={isSaved(id!)} // ✅ FIXED
            onSave={() => handleSave(id!)}
          />

          <CourseSidebar course={course} onOpen={() => {}} />
        </div>

        <ReviewSection
          course={course}
          reviewRating={reviewRating}
          setReviewRating={setReviewRating}
          reviewText={reviewText}
          setReviewText={setReviewText}
          handleReviewSubmit={handleReviewSubmit}
          submitLoading={submitLoading}
          error={error}
        />
      </div>
    </div>
  );
};

export default CourseDetails;
