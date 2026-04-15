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

    if (profile.tutorProfile?.skills?.includes(newSkill)) {
      setSkillInput("");
      return;
    }

    setProfile({
      ...profile,
      tutorProfile: {
        ...profile.tutorProfile,
        skills: [
          ...(profile.tutorProfile?.skills || []),
          newSkill,
        ],
      },
    });

    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    if (!profile?.tutorProfile) return;

    setProfile({
      ...profile,
      tutorProfile: {
        ...profile.tutorProfile,
        skills: profile.tutorProfile.skills?.filter(
          (s) => s !== skill
        ),
      },
    });
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
              headline: profile.tutorProfile?.headline,
              bio: profile.tutorProfile?.bio,
              skills: profile.tutorProfile?.skills || [],
              categories: profile.tutorProfile?.categories || [],
              experience: profile.tutorProfile?.experience || 0,
              experienceDetails:
                profile.tutorProfile?.experienceDetails || "",
              education: profile.tutorProfile?.education || "",
              portfolioLinks:
                profile.tutorProfile?.portfolioLinks || [],
              languages:
                profile.tutorProfile?.languages || [],
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

      setUser((prev) =>
        prev
          ? {
              ...prev,
              name: updated.fullName || prev.name,
              profilePhoto:
                updated.profilePhoto || prev.profilePhoto,
              isTutor: updated.isTutor ?? prev.isTutor,
            }
          : prev
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= UI ================= */

  if (loading) return <div>Loading...</div>;
  if (!profile) return null;

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
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

      {/* BIO */}
      <motion.div className={styles.card} whileHover={{ y: -4 }}>
        <h3>About</h3>
        {edit ? (
          <textarea
            value={profile.bio || ""}
            onChange={(e) =>
              setProfile({ ...profile, bio: e.target.value })
            }
          />
        ) : (
          <p>{profile.bio}</p>
        )}
      </motion.div>

      {/* TUTOR */}
      {profile.isTutor && (
        <motion.div className={styles.card}>
          <h3>Tutor Profile</h3>

          {/* HEADLINE */}
          {edit ? (
            <input
              value={profile.tutorProfile?.headline || ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  tutorProfile: {
                    ...profile.tutorProfile,
                    headline: e.target.value,
                  },
                })
              }
            />
          ) : (
            <p>{profile.tutorProfile?.headline}</p>
          )}

          {/* SKILLS */}
          <div className={styles.skills}>
            <AnimatePresence>
              {profile.tutorProfile?.skills?.map((skill) => (
                <motion.div
                  key={skill}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
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

          {/* ADD SKILL */}
          {edit && (
            <div className={styles.addSkill}>
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add skill"
                onKeyDown={(e) => {
                  if (e.key === "Enter") addSkill();
                }}
              />
              <button onClick={addSkill}>Add</button>
            </div>
          )}

          {/* INFO */}
          <p>
            <strong>Experience:</strong>{" "}
            {profile.tutorProfile?.experience} yrs
          </p>

          <p>
            <strong>Mode:</strong>{" "}
            {profile.tutorProfile?.teachingMode}
          </p>

          <p>
            <strong>Available:</strong>{" "}
            {profile.tutorProfile?.availability
              ? "Yes"
              : "No"}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Profile;