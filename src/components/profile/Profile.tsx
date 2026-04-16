import React, { useEffect, useState } from "react";
import styles from "./Profile.module.scss";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  getMyProfile,
  updateProfile,
} from "../../services/profile.service";
import { uploadProfilePhoto } from "../../services/upload.service";

/* ================= TYPES ================= */

interface TutorProfile {
  headline?: string;
  bio?: string;
  skills?: string[];
  categories?: string[];
  experience?: number;
  experienceDetails?: string;
  education?: string;
  portfolioLinks?: string[];
  languages?: string[];
  availability?: boolean;
  teachingMode?: string;
}

interface ProfileData {
  fullName?: string;
  bio?: string;
  profilePhoto?: string;
  city?: string;
  country?: string;
  isTutor?: boolean;
  tutorProfile?: TutorProfile;
}

/* ================= ANIMATION ================= */

const skillVariants = {
  hidden: { opacity: 0, scale: 0.6, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.6, y: -10 },
};

/* ================= COMPONENT ================= */

const Profile: React.FC = () => {
  const { setUser } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [skillInput, setSkillInput] = useState("");

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* ================= SKILLS ================= */

  const addSkill = () => {
    if (!skillInput.trim() || !profile) return;

    const newSkill = skillInput.trim();
    const currentSkills = profile.tutorProfile?.skills || [];

    if (currentSkills.includes(newSkill)) {
      setSkillInput("");
      return;
    }

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            tutorProfile: {
              ...prev.tutorProfile,
              skills: [...currentSkills, newSkill],
            },
          }
        : prev
    );

    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            tutorProfile: {
              ...prev.tutorProfile,
              skills:
                prev.tutorProfile?.skills?.filter(
                  (s) => s !== skill
                ) || [],
            },
          }
        : prev
    );
  };

  /* ================= PHOTO ================= */

  const handlePhoto = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    const imageUrl = await uploadProfilePhoto(file);

    setProfile({ ...profile, profilePhoto: imageUrl });

    setUser((prev) =>
      prev ? { ...prev, profilePhoto: imageUrl } : prev
    );
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (!profile) return;

    try {
      const payload = {
        fullName: profile.fullName,
        bio: profile.bio,
        city: profile.city,
        country: profile.country,
        profilePhoto: profile.profilePhoto,

        tutorProfile: profile.isTutor
          ? {
              ...profile.tutorProfile,
              skills: profile.tutorProfile?.skills || [],
              categories:
                profile.tutorProfile?.categories || [],
              languages:
                profile.tutorProfile?.languages || [],
              portfolioLinks:
                profile.tutorProfile?.portfolioLinks || [],
              availability:
                profile.tutorProfile?.availability ?? false,
              teachingMode:
                profile.tutorProfile?.teachingMode || "Online",
            }
          : undefined,
      };

      const updated = await updateProfile(payload);

      setProfile(updated);
      setEdit(false);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= UI ================= */

  if (loading) return <div>Loading...</div>;
  if (!profile) return null;

  return (
    <motion.div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.profileBlock}>
          <div className={styles.photoWrapper}>
            <img
              src={
                profile.profilePhoto ||
                "https://i.pravatar.cc/150"
              }
            />

            {edit && (
              <label className={styles.uploadOverlay}>
                Change
                <input type="file" hidden onChange={handlePhoto} />
              </label>
            )}
          </div>

          <div>
            {edit ? (
              <input
                value={profile.fullName || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    fullName: e.target.value,
                  })
                }
              />
            ) : (
              <h2>{profile.fullName}</h2>
            )}

            <p>
              {profile.city}, {profile.country}
            </p>

            {profile.isTutor && (
              <span className={styles.badge}>Tutor</span>
            )}
          </div>
        </div>

        <div>
          {edit ? (
            <>
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setEdit(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setEdit(true)}>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* ABOUT */}
      <div className={styles.card}>
        <h3>About</h3>
        <p>{profile.bio}</p>
      </div>

      {/* ================= TUTOR ================= */}
      {profile.isTutor && (
        <div className={styles.tutorGrid}>
          {/* LEFT */}
          <div className={styles.card}>
            <h3>Headline</h3>
            <p>{profile.tutorProfile?.headline}</p>

            <h3>Tutor Bio</h3>
            <p>{profile.tutorProfile?.bio}</p>

            <h3>Skills</h3>
            <div className={styles.skills}>
              <AnimatePresence>
                {profile.tutorProfile?.skills?.map((skill) => (
                  <motion.div
                    key={skill}
                    variants={skillVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className={styles.skillTag}
                  >
                    {skill}
                    {edit && (
                      <span onClick={() => removeSkill(skill)}>
                        ×
                      </span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {edit && (
              <div className={styles.addSkill}>
                <input
                  value={skillInput}
                  onChange={(e) =>
                    setSkillInput(e.target.value)
                  }
                  placeholder="Add skill"
                  onKeyDown={(e) =>
                    e.key === "Enter" && addSkill()
                  }
                />
                <button onClick={addSkill}>Add</button>
              </div>
            )}

            <h3>Categories</h3>
            <div className={styles.skills}>
              {profile.tutorProfile?.categories?.map((cat) => (
                <span key={cat} className={styles.skillTag}>
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className={styles.card}>
            <h3>Experience</h3>
            <p>
              {profile.tutorProfile?.experience || 0} years
            </p>
            <p>{profile.tutorProfile?.experienceDetails}</p>

            <h3>Education</h3>
            <p>
              {profile.tutorProfile?.education ||
                "Not specified"}
            </p>

            <h3>Languages</h3>
            <div className={styles.skills}>
              {profile.tutorProfile?.languages?.map((lang) => (
                <span key={lang} className={styles.skillTag}>
                  {lang}
                </span>
              ))}
            </div>

            <h3>Availability</h3>
            <p>
              {profile.tutorProfile?.availability
                ? "Available"
                : "Not Available"}
            </p>

            <p>
              Mode: {profile.tutorProfile?.teachingMode}
            </p>
          </div>

          {/* FULL WIDTH */}
          <div
            className={styles.card}
            style={{ gridColumn: "span 2" }}
          >
            <h3>Portfolio / Links</h3>

            {profile.tutorProfile?.portfolioLinks?.length ? (
              <ul>
                {profile.tutorProfile.portfolioLinks.map(
                  (link) => (
                    <li key={link}>
                      <a href={link} target="_blank">
                        {link}
                      </a>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p>No links added</p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Profile;