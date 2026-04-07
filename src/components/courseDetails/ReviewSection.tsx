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

  return (
    <div className={styles.section}>
      <h2>Student Reviews</h2>

      {/* ⭐ SUMMARY */}
      <div className={styles.summary}>
        <div className={styles.avg}>
          <h1>{course.averageRating?.toFixed(1) || "0.0"}</h1>

          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={
                  s <= Math.round(course.averageRating || 0)
                    ? styles.active
                    : ""
                }
              >
                ★
              </span>
            ))}
          </div>

          {/* ✅ NOW total is USED */}
          <p>{total} ratings</p>
        </div>

        {/* 📊 BREAKDOWN */}
        <div className={styles.breakdown}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count =
              course.reviews?.filter(
                (r: { rating: number }) => r.rating === star,
              ).length || 0;

            const percent = total ? (count / total) * 100 : 0;

            return (
              <div key={star} className={styles.barRow}>
                <span>{star}★</span>

                <div className={styles.bar}>
                  <div
                    className={styles.fill}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <span>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ✍️ ADD REVIEW (UNCHANGED) */}
      <div className={styles.addReview}>
        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              onClick={() => setReviewRating(s)}
              className={s <= reviewRating ? styles.active : ""}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />

        {error && <p className={styles.error}>{error}</p>}

        <button
          onClick={handleReviewSubmit}
          disabled={!reviewRating || !reviewText.trim()}
        >
          {submitLoading ? "Submitting..." : "Submit"}
        </button>
      </div>

      {/* 💬 REVIEW LIST (UNCHANGED) */}
      <div className={styles.reviewList}>
        {course.reviews?.map((rev: any, i: number) => (
          <div key={i} className={styles.reviewCard}>
            {/* LEFT AVATAR */}
            <div className={styles.avatar}>
              {typeof rev.user === "object" && rev.user?.name
                ? rev.user.name.charAt(0).toUpperCase()
                : "U"}
            </div>

            {/* RIGHT CONTENT */}
            <div className={styles.content}>
              {/* HEADER */}
              <div className={styles.header}>
                <span className={styles.name}>
                  {typeof rev.user === "object" && rev.user?.name
                    ? rev.user.name
                    : "User"}
                </span>

                <span className={styles.time}>
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* STARS */}
              <div className={styles.stars}>
                {"★".repeat(rev.rating)}
                {"☆".repeat(5 - rev.rating)}
              </div>

              {/* COMMENT */}
              <p className={styles.comment}>{rev.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;
