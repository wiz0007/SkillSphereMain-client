import React, { useEffect, useState } from "react";
import styles from "./Profile.module.scss";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  getMyProfile,
  updateProfile,
} from "../../services/profile.service";
import { uploadProfilePhoto } from "../../services/upload.service";

const CACHE_KEY = "profile_cache";
const CACHE_TTL = 5 * 60 * 1000;

/* ================= TYPES ================= */

interface TutorProfile {
  headline?: string;
  skills?: string[];
  hourlyRate?: number;
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
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [skillInput, setSkillInput] = useState("");

  /* ================= CACHE ================= */

  const getCache = (): ProfileData | null => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);

      if (Date.now() - parsed.timestamp > CACHE_TTL) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return parsed.data;
    } catch {
      return null;
    }
  };

  const setCache = (data: ProfileData) => {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  };

  /* ================= FETCH ================= */

  useEffect(() => {
    if (!user?._id) return;

    const cached = getCache();

    if (cached) {
      setProfile(cached);
      setLoading(false);
    }

    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        setProfile(data);
        setCache(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  /* ================= SKILLS ================= */

  const addSkill = () => {
    if (!skillInput.trim() || !profile) return;

    const newSkill = skillInput.trim();

    // prevent duplicates
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

    try {
      const imageUrl = await uploadProfilePhoto(file);

      const updated = { ...profile, profilePhoto: imageUrl };

      setProfile(updated);
      setCache(updated);

      setUser((prev) =>
        prev ? { ...prev, profilePhoto: imageUrl } : prev
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (!profile) return;

    try {
      const updated = await updateProfile(profile);

      setProfile(updated);
      setCache(updated);
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

  if (loading) return <div className={styles.loader}>Loading...</div>;
  if (!profile) return null;

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.left}>
          <div className={styles.photoWrapper}>
            <img
              src={
                profile.profilePhoto ||
                "https://i.pravatar.cc/150"
              }
              alt="profile"
            />

            {edit && (
              <label className={styles.uploadOverlay}>
                Change
                <input
                  type="file"
                  hidden
                  onChange={handlePhoto}
                />
              </label>
            )}
          </div>

          <div className={styles.identity}>
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
              <h2>{profile.fullName || user?.name}</h2>
            )}

            {edit ? (
              <textarea
                value={profile.bio || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    bio: e.target.value,
                  })
                }
              />
            ) : (
              <p>{profile.bio || "No bio added"}</p>
            )}

            {profile.isTutor && (
              <span className={styles.tutorBadge}>
                Tutor
              </span>
            )}
          </div>
        </div>

        <div className={styles.right}>
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

      {/* GRID */}
      <div className={styles.grid}>
        {/* LOCATION */}
        <motion.div className={styles.card} whileHover={{ y: -5 }}>
          <h3>Location</h3>

          {edit ? (
            <>
              <input
                placeholder="City"
                value={profile.city || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    city: e.target.value,
                  })
                }
              />
              <input
                placeholder="Country"
                value={profile.country || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    country: e.target.value,
                  })
                }
              />
            </>
          ) : (
            <p>
              {profile.city}, {profile.country}
            </p>
          )}
        </motion.div>

        {/* TUTOR */}
        {profile.isTutor && (
          <motion.div className={styles.card}>
            <h3>Tutor Info</h3>

            {edit ? (
              <input
                placeholder="Headline"
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
              <p>{profile.tutorProfile?.headline || "—"}</p>
            )}

            {/* SKILLS */}
            <div className={styles.skillsContainer}>
              <div className={styles.skillBox}>
                {profile.tutorProfile?.skills?.map((skill) => (
                  <div key={skill} className={styles.skillTag}>
                    {skill}
                    {edit && (
                      <span onClick={() => removeSkill(skill)}>
                        ×
                      </span>
                    )}
                  </div>
                ))}

                {edit && (
                  <input
                    value={skillInput}
                    placeholder="Add skill"
                    onChange={(e) =>
                      setSkillInput(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {edit ? (
              <input
                type="number"
                value={profile.tutorProfile?.hourlyRate || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    tutorProfile: {
                      ...profile.tutorProfile,
                      hourlyRate: Number(e.target.value),
                    },
                  })
                }
              />
            ) : (
              <p>₹{profile.tutorProfile?.hourlyRate}/hr</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;