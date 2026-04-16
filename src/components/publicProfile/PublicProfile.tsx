import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./PublicProfile.module.scss";
import { motion } from "framer-motion";
import { getPublicProfile } from "../../services/profile.service";

/* ================= ANIMATIONS ================= */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/* ================= COMPONENT ================= */

const PublicProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;

    const fetch = async () => {
      const data = await getPublicProfile(userId);
      setProfile(data);
    };

    fetch();
  }, [userId]);

  if (!profile) return <div>Loading...</div>;

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* HEADER */}
      <motion.div className={styles.header} variants={fadeUp}>
        <motion.img
          className={styles.avatar}
          src={profile.profilePhoto || "https://i.pravatar.cc/150"}
          whileHover={{ scale: 1.05 }}
        />

        <div className={styles.info}>
          <h1>@{profile.username}</h1>
          <p>
            {profile.city}, {profile.country}
          </p>

          {profile.isTutor && (
            <span className={styles.badge}>Tutor</span>
          )}
        </div>

        {profile.isTutor && (
          <motion.button
            className={styles.cta}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Book Session
          </motion.button>
        )}
      </motion.div>

      {/* ABOUT */}
      <motion.div className={styles.card} variants={fadeUp}>
        <h3>About</h3>
        <p>{profile.bio}</p>
      </motion.div>

      {/* ================= TUTOR ================= */}
      {profile.isTutor && (
        <motion.div className={styles.grid} variants={containerVariants}>
          {/* LEFT */}
          <motion.div className={styles.card} variants={fadeUp}>
            <h3>{profile.tutorProfile?.headline}</h3>
            <p>{profile.tutorProfile?.bio}</p>

            <h4>Skills</h4>
            <div className={styles.tags}>
              {profile.tutorProfile?.skills?.map((s: string) => (
                <motion.span
                  key={s}
                  whileHover={{ scale: 1.1 }}
                >
                  {s}
                </motion.span>
              ))}
            </div>

            <h4>Categories</h4>
            <div className={styles.tags}>
              {profile.tutorProfile?.categories?.map((c: string) => (
                <motion.span
                  key={c}
                  whileHover={{ scale: 1.1 }}
                >
                  {c}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div className={styles.card} variants={fadeUp}>
            <h4>Experience</h4>
            <p>{profile.tutorProfile?.experience} years</p>

            <p>{profile.tutorProfile?.experienceDetails}</p>

            <h4>Education</h4>
            <p>{profile.tutorProfile?.education}</p>

            <h4>Languages</h4>
            <div className={styles.tags}>
              {profile.tutorProfile?.languages?.map((l: string) => (
                <motion.span
                  key={l}
                  whileHover={{ scale: 1.1 }}
                >
                  {l}
                </motion.span>
              ))}
            </div>

            <h4>Availability</h4>
            <p>
              {profile.tutorProfile?.availability
                ? "Available"
                : "Not Available"}
            </p>

            <p>{profile.tutorProfile?.teachingMode}</p>
          </motion.div>

          {/* FULL WIDTH */}
          <motion.div
            className={styles.cardFull}
            variants={fadeUp}
          >
            <h4>Portfolio</h4>

            {profile.tutorProfile?.portfolioLinks?.length ? (
              profile.tutorProfile.portfolioLinks.map(
                (link: string) => (
                  <a key={link} href={link} target="_blank">
                    {link}
                  </a>
                )
              )
            ) : (
              <p className={styles.empty}>No links added</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PublicProfile;
