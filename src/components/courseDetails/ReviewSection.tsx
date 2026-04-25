import { MessageSquareText, PenLine, Star } from "lucide-react";
import styles from "./CourseDetails.module.scss";

const ReviewSection = ({
  course,
  reviewRating,
  setReviewRating,
  reviewText,
  setReviewText,
  handleReviewSubmit,
  submitLoading,
  error,
}: any) => {
  const total = course.totalRatings || 0;
  const average = course.averageRating || 0;
  const reviews = course.reviews || [];

  const getReviewerName = (user: any) => {
    if (typeof user === "object") {
      return user?.name || user?.username || "Learner";
    }

    return "Learner";
  };

  const getInitial = (user: any) =>
    getReviewerName(user).charAt(0).toUpperCase();

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <span className={styles.kicker}>Reviews</span>
          <h2>What learners are saying</h2>
          <p>
            Ratings and written feedback update here as soon as new
            responses land.
          </p>
        </div>

        <div className={styles.sectionSnapshot}>
          <span className={styles.snapshotLabel}>Learner sentiment</span>
          <strong>
            {average ? average.toFixed(1) : "New"} average rating
          </strong>
          <span className={styles.snapshotHint}>
            {reviews.length} written reviews across {total} ratings
          </span>
        </div>
      </div>

      <div className={styles.summary}>
        <div className={styles.avg}>
          <span className={styles.summaryLabel}>Overall score</span>
          <h1>{average ? average.toFixed(1) : "0.0"}</h1>

          <div className={styles.inlineStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`${styles.starIcon} ${
                  star <= Math.round(average)
                    ? styles.activeStar
                    : ""
                }`}
              >
                <Star size={17} fill="currentColor" />
              </span>
            ))}
          </div>

          <p>{total} ratings submitted</p>
        </div>

        <div className={styles.breakdown}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count =
              reviews.filter(
                (review: { rating: number }) =>
                  review.rating === star
              ).length || 0;

            const percent = total ? (count / total) * 100 : 0;

            return (
              <div key={star} className={styles.barRow}>
                <span className={styles.barLabel}>{star} star</span>

                <div className={styles.bar}>
                  <div
                    className={styles.fill}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <span className={styles.barCount}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.reviewComposer}>
        <div className={styles.composerHeader}>
          <div>
            <span className={styles.summaryLabel}>Add your review</span>
            <h3>Share what stood out</h3>
          </div>
          <PenLine size={18} className={styles.composerIcon} />
        </div>

        <div className={styles.reviewStars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`${styles.starButton} ${
                star <= reviewRating ? styles.activeStar : ""
              }`}
              onClick={() => setReviewRating(star)}
              aria-label={`Select ${star} star rating`}
            >
              <Star size={17} fill="currentColor" />
            </button>
          ))}
        </div>

        <textarea
          value={reviewText}
          placeholder="Describe the pace, clarity, and what made the course useful for you."
          onChange={(event) => setReviewText(event.target.value)}
        />

        {error ? <p className={styles.error}>{error}</p> : null}

        <button
          type="button"
          className={styles.composeButton}
          onClick={handleReviewSubmit}
          disabled={!reviewRating || !reviewText.trim()}
        >
          <MessageSquareText size={16} />
          {submitLoading ? "Submitting..." : "Submit review"}
        </button>
      </div>

      <div className={styles.reviewList}>
        {reviews.length ? (
          reviews.map((review: any, index: number) => (
            <article key={index} className={styles.reviewCard}>
              <div className={styles.avatar}>
                {getInitial(review.user)}
              </div>

              <div className={styles.reviewBody}>
                <div className={styles.reviewHeader}>
                  <div>
                    <span className={styles.name}>
                      {getReviewerName(review.user)}
                    </span>
                    <span className={styles.time}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className={styles.inlineStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`${styles.starIcon} ${
                          star <= review.rating
                            ? styles.activeStar
                            : ""
                        }`}
                      >
                        <Star size={15} fill="currentColor" />
                      </span>
                    ))}
                  </div>
                </div>

                <p className={styles.comment}>{review.comment}</p>
              </div>
            </article>
          ))
        ) : (
          <div className={styles.emptyReviews}>
            <strong>No written reviews yet</strong>
            <span>
              Once learners leave feedback, their comments will
              appear here.
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewSection;
