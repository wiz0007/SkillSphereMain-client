import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "./CourseDetails.module.scss";
import CourseHero from "./CourseHero";
import CourseSidebar from "./CourseSidebar";
import ReviewSection from "./ReviewSection";
import { useCourseDetails } from "./useCourseDetails";
import { useSaveCourse } from "./useSaveCourse";
import RequestSession from "../requestSession/RequestSession";
import { useAuth } from "../../context/AuthContext";
import SeoHead from "../../seo/SeoHead";
import { buildCanonicalUrl, sanitizeSeoText } from "../../seo/seoConfig";
import { trackSeoEvent } from "../../seo/analytics";

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
      ? "Sign in and complete an enrollment before leaving written feedback."
      : canReview
        ? reviewEligibility?.hasReviewed
          ? "Update your written feedback any time based on your learning experience."
          : "You have enrolled in this course, so you can leave written feedback."
        : "Written feedback unlocks after you have an accepted booking for this course.";

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

  useEffect(() => {
    trackSeoEvent("view_course", {
      course_type: course.type,
      course_level: course.level || "",
      course_category: course.category || "",
    });
  }, [course._id, course.type, course.level, course.category]);

  return (
    <section className={styles.page}>
      <SeoHead
        metadata={{
          title: `${sanitizeSeoText(course.title)}${
            course.tutor?.fullName || course.tutor?.username
              ? ` with ${sanitizeSeoText(course.tutor.fullName || course.tutor.username)}`
              : ""
          } | SkillSphere`,
          description: `Learn ${sanitizeSeoText(course.skills?.[0] || course.category || course.title)}${
            course.tutor?.fullName || course.tutor?.username
              ? ` with ${sanitizeSeoText(course.tutor.fullName || course.tutor.username)}`
              : ""
          }. View level, format, ratings, reviews, and SkillCoin booking details.`,
          canonicalUrl: buildCanonicalUrl(`/courses/${course.slug || course._id}`),
          robots:
            course.seoStatus === "public-indexable"
              ? "index,follow"
              : "noindex,follow",
          type: "website",
          structuredData: [
            {
              "@context": "https://schema.org",
              "@type": "Course",
              name: course.title,
              description: course.description,
              provider: {
                "@type": "Person",
                name: course.tutor?.fullName || course.tutor?.username || "SkillSphere tutor",
              },
              offers: {
                "@type": "Offer",
                price: course.price || 0,
                priceCurrency: "INR",
                availability: "https://schema.org/InStock",
              },
              aggregateRating:
                course.averageRating && course.totalRatings
                  ? {
                      "@type": "AggregateRating",
                      ratingValue: course.averageRating,
                      ratingCount: course.totalRatings,
                    }
                  : undefined,
            },
          ],
        }}
      />
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
