import React, { useEffect, useState } from "react";
import styles from "./Profile.module.scss";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { getMyProfile, updateProfile } from "../../services/profile.service";
import { uploadProfilePhoto } from "../../services/upload.service";

const Profile: React.FC = () => {
  const { setUser } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);

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

  /* ================= PHOTO ================= */
  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadProfilePhoto(file);

      setProfile((prev: any) => ({
        ...prev,
        profilePhoto: imageUrl,
      }));

      setUser((prev) =>
        prev ? { ...prev, profilePhoto: imageUrl } : prev
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      const updated = await updateProfile(profile);
      setProfile(updated);
      setEdit(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className={styles.loader}>Loading...</div>;
  if (!profile) return null;

  return (
    <div className={styles.container}>

      {/* ================= HEADER ================= */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* LEFT */}
        <div className={styles.left}>
          
          <div className={styles.photoWrapper}>
            <img
              src={profile.profilePhoto || "https://i.pravatar.cc/150"}
              alt="profile"
            />

            {edit && (
              <label className={styles.uploadOverlay}>
                Change
                <input type="file" onChange={handlePhoto} hidden />
              </label>
            )}
          </div>

          <div className={styles.identity}>
            {edit ? (
              <input
                value={profile.fullName || profile.name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, fullName: e.target.value })
                }
              />
            ) : (
              <h2>{profile.fullName || profile.name}</h2>
            )}

            {!edit && <p>{profile.bio}</p>}

            {profile.isTutor && (
              <span className={styles.tutorBadge}>Tutor</span>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.right}>
          {edit ? (
            <>
              <button onClick={handleSave}>Save</button>
              <button
                className={styles.cancel}
                onClick={() => setEdit(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setEdit(true)}>Edit Profile</button>
          )}
        </div>
      </motion.div>

      {/* ================= GRID ================= */}
      <div className={styles.grid}>

        {/* LOCATION */}
        <motion.div className={styles.card} whileHover={{ y: -5 }}>
          <h3>Location</h3>

          {edit ? (
            <>
              <input
                value={profile.country || ""}
                onChange={(e) =>
                  setProfile({ ...profile, country: e.target.value })
                }
              />

              <input
                value={profile.city || ""}
                onChange={(e) =>
                  setProfile({ ...profile, city: e.target.value })
                }
              />
            </>
          ) : (
            <p>
              {profile.city || "—"}, {profile.country || "—"}
            </p>
          )}
        </motion.div>

        {/* TUTOR */}
        {profile.isTutor && (
          <motion.div className={styles.card} whileHover={{ y: -5 }}>
            <h3>Tutor Info</h3>

            <p className={styles.headline}>
              {profile.tutorProfile?.headline || "—"}
            </p>

            <div className={styles.tags}>
              {profile.tutorProfile?.skills?.map((s: string) => (
                <span key={s}>{s}</span>
              ))}
            </div>

            <p className={styles.price}>
              ₹{profile.tutorProfile?.hourlyRate || 0}/hr
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;