import { useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./CourseDetails.module.scss";
import CourseHero from "./CourseHero";
import CourseSidebar from "./CourseSidebar";
import ReviewSection from "./ReviewSection";
import { useCourseDetails } from "./useCourseDetails";
import { useSaveCourse } from "./useSaveCourse";
import RequestSession from "../requestSession/RequestSession";

const CourseDetails = () => {
  const { id } = useParams();
  const [open, setOpen] = useState(false);

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

  if (loading || !course) {
    return (
      <section className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            Loading course details...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <CourseHero
            course={course}
            hover={hover}
            setHover={setHover}
            userRating={userRating}
            handleRate={handleRate}
            saved={isSaved(id!)}
            onSave={() => handleSave(id!)}
          />

          <CourseSidebar course={course} onOpen={() => setOpen(true)} />
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

      {open ? (
        <RequestSession
          course={course}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </section>
  );
};

export default CourseDetails;
