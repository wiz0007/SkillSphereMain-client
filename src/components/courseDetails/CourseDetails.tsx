import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import styles from "./CourseDetails.module.scss";

import {
  getCourseById,
  rateCourse,
  type Course,
} from "../../services/courses.service";

const CourseDetails = () => {
  const { id } = useParams();

  const [course, setCourse] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  /* ⭐ RATING STATES */
  const [hover, setHover] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [rating, setRating] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!id) return;

    getCourseById(id).then((data) => {
      setCourse(data);
      setRating(data.averageRating || 0);
      setTotal(data.totalRatings || 0);
    });
  }, [id]);

  /* ⭐ HANDLE RATE */
  const handleRate = async (value: number) => {
    if (!id) return;

    try {
      setUserRating(value); // instant UI

      const res = await rateCourse(id, value);

      setRating(res.averageRating);
      setTotal(res.totalRatings);
    } catch (err) {
      console.error(err);
    }
  };

  if (!course) return <div className={styles.center}>Loading...</div>;

  const activeValue = hover || userRating || Math.round(rating);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        
        {/* HERO */}
        <div className={styles.hero}>
          
          {/* LEFT */}
          <div className={styles.left}>
            <h1>{course.title}</h1>

            <p className={styles.desc}>{course.description}</p>

            {/* ⭐ RATING */}
            <div className={styles.ratingRow}>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className={star <= activeValue ? styles.active : ""}
                  >
                    ★
                  </span>
                ))}
              </div>

              <span className={styles.ratingText}>
                {rating.toFixed(1)} ({total} ratings)
              </span>
            </div>

            {/* BADGES */}
            <div className={styles.badges}>
              <span>{course.category}</span>
              <span>{course.level}</span>
              <span>{course.duration}</span>
            </div>

            {/* SKILLS */}
            <div className={styles.skills}>
              {course.skills?.map((s, i) => (
                <span key={i}>{s}</span>
              ))}
            </div>

            {/* SAVE */}
            <button
              className={styles.save}
              onClick={() => setSaved(!saved)}
            >
              {saved ? "❤️ Saved" : "🤍 Save Course"}
            </button>
          </div>

          {/* RIGHT */}
          <div className={styles.right}>
            
            {/* VIDEO */}
            <div className={styles.video}>
              <iframe
                src="https://www.youtube.com/embed/dGcsHMXbSOA"
                title="preview"
                allowFullScreen
              />
            </div>

            {/* CARD */}
            <div className={styles.card}>
              <h3>₹ {course.price}</h3>

              <button onClick={() => setOpen(true)}>
                Request Session
              </button>

              <ul>
                <li>✔ 1-on-1 mentorship</li>
                <li>✔ Flexible timing</li>
                <li>✔ Real-world projects</li>
              </ul>
            </div>
          </div>
        </div>

        {/* LEARN */}
        <div className={styles.section}>
          <h2>What you'll learn</h2>
          <ul>
            {course.skills?.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        {/* REVIEWS */}
        <div className={styles.section}>
          <h2>Reviews</h2>

          <div className={styles.review}>
            ⭐⭐⭐⭐⭐
            <p>Great course, very practical!</p>
          </div>

          <div className={styles.review}>
            ⭐⭐⭐⭐☆
            <p>Good explanation and guidance.</p>
          </div>
        </div>
      </div>

      {/* MOBILE CTA */}
      <div className={styles.mobileBar}>
        <button onClick={() => setOpen(true)}>
          Request Session • ₹ {course.price}
        </button>
      </div>

      {/* MODAL */}
      {open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Book Session</h3>

            <input type="date" />
            <input type="time" />

            <button>Confirm Booking</button>
            <span onClick={() => setOpen(false)}>Close</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;