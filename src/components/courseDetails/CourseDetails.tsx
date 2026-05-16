import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "./CourseDetails.module.scss";
import CourseHero from "./CourseHero";
import CourseSidebar from "./CourseSidebar";
import ReviewSection from "./ReviewSection";
import { useCourseDetails } from "./useCourseDetails";
import { useSaveCourse } from "./useSaveCourse";
import RequestSession from "../requestSession/RequestSession";
import { useAuth } from "../../context/AuthContext";

const CourseDetails = () => {
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    recordedActionLoading,
    recordedError,
    handleRecordedPurchaseRequest,
    handleApproveRecordedRequest,
    handleRejectRecordedRequest,
    tuitionActionLoading,
    tuitionError,
    handleTuitionEnrollmentRequest,
    handleApproveTuitionRequest,
    handleRejectTuitionRequest,
    handlePauseTuitionEnrollment,
    handleResumeTuitionEnrollment,
    handleCancelTuitionEnrollment,
  } = useCourseDetails(id);

  const { isSaved, handleSave } = useSaveCourse();
  const isOwnCourse = Boolean(
    user?._id &&
      course?.tutor?._id &&
      user._id.toString() === course.tutor._id.toString()
  );
  const reviewEligibility = course?.reviewEligibility;
  const canReview = !isOwnCourse && Boolean(reviewEligibility?.canReview);
  const reviewHint = isOwnCourse
    ? "Learner ratings and written feedback are shown here. Review submission is disabled while previewing your own course."
    : !user
      ? "Sign in and complete an enrollment before leaving a review."
      : canReview
        ? reviewEligibility?.hasReviewed
          ? "Update your review any time based on your learning experience."
          : "You have enrolled in this course, so you can leave a review."
        : "Review submission unlocks after you have an accepted booking for this course.";

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

  const handleOpenRequest = () => {
    if (!user) {
      navigate("/login", {
        state: { from: location.pathname },
      });
      return;
    }

    setOpen(true);
  };

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
            isOwnCourse={isOwnCourse}
          />

          <CourseSidebar
            course={course}
            onOpen={handleOpenRequest}
            canRequestSession={!isOwnCourse}
            isOwnCourse={isOwnCourse}
            isLoggedIn={Boolean(user)}
            onRecordedPurchaseRequest={handleRecordedPurchaseRequest}
            onApproveRecordedRequest={handleApproveRecordedRequest}
            onRejectRecordedRequest={handleRejectRecordedRequest}
            recordedActionLoading={recordedActionLoading}
            recordedError={recordedError}
            onTuitionEnrollmentRequest={handleTuitionEnrollmentRequest}
            onApproveTuitionRequest={handleApproveTuitionRequest}
            onRejectTuitionRequest={handleRejectTuitionRequest}
            onPauseTuitionEnrollment={handlePauseTuitionEnrollment}
            onResumeTuitionEnrollment={handleResumeTuitionEnrollment}
            onCancelTuitionEnrollment={handleCancelTuitionEnrollment}
            tuitionActionLoading={tuitionActionLoading}
            tuitionError={tuitionError}
          />
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
          canReview={canReview}
          reviewHint={reviewHint}
          isOwnCourse={isOwnCourse}
        />
      </div>

      {open && !isOwnCourse ? (
        <RequestSession
          course={course}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </section>
  );
};

export default CourseDetails;
