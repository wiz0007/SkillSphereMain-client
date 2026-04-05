import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./CourseDetails.module.scss";

import { getCourseById, type Course } from "../../services/courses.service";

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    getCourseById(id).then(setCourse);
  }, [id]);

  if (!course) return <div className={styles.center}>Loading...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        
        {/* HERO */}
        <div className={styles.hero}>
          
          {/* LEFT */}
          <div className={styles.left}>
            <h1>{course.title}</h1>

            <p className={styles.desc}>{course.description}</p>

            {/* RATING */}
            <div className={styles.rating}>
              ⭐ 4.8 (120 students)
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