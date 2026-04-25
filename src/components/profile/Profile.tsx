import React, { useEffect, useMemo, useState } from "react";
import styles from "./Profile.module.scss";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpenText,
  BriefcaseBusiness,
  Camera,
  Clock3,
  Globe2,
  GraduationCap,
  Languages,
  Link2,
  MapPin,
  PencilLine,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getMyProfile,
  updateProfile,
} from "../../services/profile.service";
import { uploadProfilePhoto } from "../../services/upload.service";

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
  rating?: number;
  totalSessions?: number;
  isVerified?: boolean;
}

interface ProfileData {
  username?: string;
  fullName?: string;
  bio?: string;
  profilePhoto?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  preferredLanguage?: string;
  timezone?: string;
  dob?: string;
  gender?: string;
  isTutor?: boolean;
  tutorProfile?: TutorProfile;
}

const EMPTY_TUTOR_PROFILE: TutorProfile = {
  headline: "",
  bio: "",
  skills: [],
  categories: [],
  experience: 0,
  experienceDetails: "",
  education: "",
  portfolioLinks: [],
  languages: [],
  availability: false,
  teachingMode: "Online",
  rating: 0,
  totalSessions: 0,
  isVerified: false,
};

const skillVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 6 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.92, y: -6 },
};

const splitListValue = (value: string) =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const createDraft = (
  value: ProfileData | null
): ProfileData | null => {
  if (!value) return null;

  return {
    ...value,
    tutorProfile: value.isTutor
      ? {
          ...EMPTY_TUTOR_PROFILE,
          ...value.tutorProfile,
          skills: [...(value.tutorProfile?.skills || [])],
          categories: [
            ...(value.tutorProfile?.categories || []),
          ],
          portfolioLinks: [
            ...(value.tutorProfile?.portfolioLinks || []),
          ],
          languages: [
            ...(value.tutorProfile?.languages || []),
          ],
        }
      : undefined,
  };
};

const getProfileCompletion = (profile: ProfileData) => {
  const baseChecks = [
    profile.fullName,
    profile.bio,
    profile.city,
    profile.state,
    profile.country,
    profile.phone,
    profile.preferredLanguage,
    profile.timezone,
    profile.profilePhoto,
  ];

  const tutorChecks = profile.isTutor
    ? [
        profile.tutorProfile?.headline,
        profile.tutorProfile?.bio,
        profile.tutorProfile?.skills?.length,
        profile.tutorProfile?.categories?.length,
        profile.tutorProfile?.education,
        profile.tutorProfile?.languages?.length,
        profile.tutorProfile?.teachingMode,
      ]
    : [];

  const checks = [...baseChecks, ...tutorChecks];
  const complete = checks.filter(Boolean).length;

  return Math.round((complete / checks.length) * 100);
};

const Profile: React.FC = () => {
  const { setUser } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [draft, setDraft] = useState<ProfileData | null>(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        setProfile(data);
        setDraft(createDraft(data));
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const activeProfile = (edit ? draft : profile) ?? profile;

  const profileStats = useMemo(() => {
    if (!activeProfile) {
      return [];
    }

    const location = [
      activeProfile.city,
      activeProfile.state,
      activeProfile.country,
    ]
      .filter(Boolean)
      .join(", ");

    const tutor = activeProfile.tutorProfile || EMPTY_TUTOR_PROFILE;

    const baseStats = [
      {
        label: "Location",
        value: location || "Location missing",
        meta: activeProfile.timezone || "Timezone not set",
        icon: MapPin,
      },
      {
        label: "Contact",
        value: activeProfile.phone || "Phone not added",
        meta:
          activeProfile.preferredLanguage ||
          "Preferred language not set",
        icon: Phone,
      },
    ];

    if (!activeProfile.isTutor) {
      return [
        ...baseStats,
        {
          label: "Profile",
          value: `${getProfileCompletion(activeProfile)}% complete`,
          meta: "Keep your learner profile up to date",
          icon: Sparkles,
        },
      ];
    }

    return [
      ...baseStats,
      {
        label: "Teaching Mode",
        value: tutor.teachingMode || "Online",
        meta: tutor.availability
          ? "Open for session requests"
          : "Currently unavailable",
        icon: BriefcaseBusiness,
      },
      {
        label: "Tutor Stack",
        value: tutor.skills?.length
          ? `${tutor.skills.length} listed skills`
          : "Add your skills",
        meta: tutor.categories?.length
          ? tutor.categories.join(" | ")
          : "Categories missing",
        icon: Languages,
      },
    ];
  }, [activeProfile]);

  const updateField = (
    field: keyof ProfileData,
    value: string
  ) => {
    setDraft((previous) =>
      previous
        ? {
            ...previous,
            [field]: value,
          }
        : previous
    );
  };

  const updateTutorField = <K extends keyof TutorProfile>(
    field: K,
    value: TutorProfile[K]
  ) => {
    setDraft((previous) =>
      previous
        ? {
            ...previous,
            tutorProfile: {
              ...EMPTY_TUTOR_PROFILE,
              ...previous.tutorProfile,
              [field]: value,
            },
          }
        : previous
    );
  };

  const updateTutorList = (
    field:
      | "categories"
      | "languages"
      | "portfolioLinks",
    value: string
  ) => {
    updateTutorField(field, splitListValue(value));
  };

  const beginEdit = () => {
    setDraft(createDraft(profile));
    setEdit(true);
  };

  const cancelEdit = () => {
    setDraft(createDraft(profile));
    setSkillInput("");
    setEdit(false);
  };

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;

    setDraft((previous) => {
      if (!previous) return previous;

      const nextSkills =
        previous.tutorProfile?.skills || [];

      if (
        nextSkills.some(
          (skill) =>
            skill.toLowerCase() === value.toLowerCase()
        )
      ) {
        return previous;
      }

      return {
        ...previous,
        tutorProfile: {
          ...EMPTY_TUTOR_PROFILE,
          ...previous.tutorProfile,
          skills: [...nextSkills, value],
        },
      };
    });

    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setDraft((previous) =>
      previous
        ? {
            ...previous,
            tutorProfile: {
              ...EMPTY_TUTOR_PROFILE,
              ...previous.tutorProfile,
              skills:
                previous.tutorProfile?.skills?.filter(
                  (item) => item !== skill
                ) || [],
            },
          }
        : previous
    );
  };

  const handlePhoto = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const imageUrl = await uploadProfilePhoto(file);
      updateField("profilePhoto", imageUrl);
    } catch (error) {
      console.error("Photo upload failed:", error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!draft) return;

    try {
      setSaving(true);

      const payload = {
        fullName: draft.fullName,
        bio: draft.bio,
        city: draft.city,
        state: draft.state,
        country: draft.country,
        phone: draft.phone,
        preferredLanguage: draft.preferredLanguage,
        timezone: draft.timezone,
        profilePhoto: draft.profilePhoto,
        dob: draft.dob,
        gender: draft.gender,
        tutorProfile: draft.isTutor
          ? {
              ...EMPTY_TUTOR_PROFILE,
              ...draft.tutorProfile,
              skills: draft.tutorProfile?.skills || [],
              categories:
                draft.tutorProfile?.categories || [],
              languages:
                draft.tutorProfile?.languages || [],
              portfolioLinks:
                draft.tutorProfile?.portfolioLinks || [],
              availability:
                draft.tutorProfile?.availability ?? false,
              teachingMode:
                draft.tutorProfile?.teachingMode || "Online",
            }
          : undefined,
      };

      const updated = await updateProfile(payload);

      setProfile(updated);
      setDraft(createDraft(updated));
      setEdit(false);
      setUser((previous) =>
        previous
          ? {
              ...previous,
              profilePhoto:
                updated.profilePhoto || previous.profilePhoto,
            }
          : previous
      );
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loader}>Loading profile...</div>
    );
  }

  if (!activeProfile) {
    return (
      <div className={styles.loader}>
        We could not load this profile right now.
      </div>
    );
  }

  const tutorProfile =
    activeProfile.tutorProfile || EMPTY_TUTOR_PROFILE;

  const location = [
    activeProfile.city,
    activeProfile.state,
    activeProfile.country,
  ]
    .filter(Boolean)
    .join(", ");

  const completion = getProfileCompletion(activeProfile);

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className={styles.header}>
        <div className={styles.heroCard}>
          <span className={styles.kicker}>Profile</span>

          <div className={styles.identity}>
            <div className={styles.photoWrapper}>
              <img
                className={styles.avatar}
                src={
                  activeProfile.profilePhoto ||
                  "https://i.pravatar.cc/160"
                }
                alt={activeProfile.fullName || "Profile"}
              />

              {edit ? (
                <label className={styles.uploadOverlay}>
                  <Camera size={14} />
                  {uploadingPhoto ? "Uploading..." : "Change photo"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handlePhoto}
                  />
                </label>
              ) : null}
            </div>

            <div className={styles.headerCopy}>
              <div className={styles.badgeRow}>
                {activeProfile.isTutor ? (
                  <span className={styles.badge}>Tutor</span>
                ) : null}
                {activeProfile.isTutor &&
                tutorProfile.isVerified ? (
                  <span
                    className={`${styles.badge} ${styles.ghostBadge}`}
                  >
                    <ShieldCheck size={14} />
                    Verified
                  </span>
                ) : null}
              </div>

              {edit ? (
                <input
                  className={styles.heroInput}
                  value={activeProfile.fullName || ""}
                  onChange={(event) =>
                    updateField("fullName", event.target.value)
                  }
                  placeholder="Full name"
                />
              ) : (
                <h1>{activeProfile.fullName || "Your profile"}</h1>
              )}

              <p className={styles.headerMeta}>
                {activeProfile.username
                  ? `@${activeProfile.username}`
                  : "Account profile"}
              </p>

              <p className={styles.summary}>
                {activeProfile.isTutor
                  ? tutorProfile.headline ||
                    "Add a headline that tells learners what they will get from working with you."
                  : activeProfile.bio ||
                    "Add a short bio to make your profile feel complete."}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.snapshot}>
          <span className={styles.snapshotLabel}>
            {edit ? "Editing" : "Status"}
          </span>
          <strong>
            {edit
              ? "Make changes and save when you are happy with the details."
              : activeProfile.isTutor
                ? tutorProfile.availability
                  ? "Tutor profile is active for incoming requests."
                  : "Tutor profile is visible but not available right now."
                : "Profile is ready for your next learning session."}
          </strong>
          <span className={styles.snapshotHint}>
            {activeProfile.isTutor
              ? `${completion}% complete | ${
                  tutorProfile.skills?.length || 0
                } skills listed`
              : `${completion}% complete | keep your details fresh`}
          </span>

          <div className={styles.headerActions}>
            {edit ? (
              <>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={cancelEdit}
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </>
            ) : (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={beginEdit}
              >
                <PencilLine size={16} />
                Edit profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {profileStats.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className={styles.statCard}>
              <div className={styles.statIcon}>
                <Icon size={18} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>
                  {item.label}
                </span>
                <strong className={styles.statValue}>
                  {item.value}
                </strong>
                <span className={styles.statMeta}>
                  {item.meta}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.contentGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.eyebrow}>Overview</span>
              <h2>About you</h2>
              <p>
                The basics students and collaborators rely on
                when they land on your profile.
              </p>
            </div>
          </div>

          <div className={styles.fieldGrid}>
            <div className={`${styles.field} ${styles.fieldWide}`}>
              <label>Short bio</label>
              {edit ? (
                <textarea
                  className={styles.textarea}
                  value={activeProfile.bio || ""}
                  onChange={(event) =>
                    updateField("bio", event.target.value)
                  }
                  placeholder="Tell people what you are focused on."
                />
              ) : (
                <p className={styles.valueBlock}>
                  {activeProfile.bio ||
                    "No personal bio added yet."}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label>Date of birth</label>
              {edit ? (
                <input
                  type="date"
                  className={styles.input}
                  value={activeProfile.dob || ""}
                  onChange={(event) =>
                    updateField("dob", event.target.value)
                  }
                />
              ) : (
                <p className={styles.inlineDetail}>
                  {activeProfile.dob || "Not shared"}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label>Gender</label>
              {edit ? (
                <input
                  className={styles.input}
                  value={activeProfile.gender || ""}
                  onChange={(event) =>
                    updateField("gender", event.target.value)
                  }
                  placeholder="Gender"
                />
              ) : (
                <p className={styles.inlineDetail}>
                  {activeProfile.gender || "Not shared"}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.eyebrow}>Details</span>
              <h2>Location and contact</h2>
              <p>
                Structured profile info that keeps the rest of
                the product in sync.
              </p>
            </div>
          </div>

          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label>City</label>
              {edit ? (
                <input
                  className={styles.input}
                  value={activeProfile.city || ""}
                  onChange={(event) =>
                    updateField("city", event.target.value)
                  }
                />
              ) : (
                <p className={styles.inlineDetail}>
                  {activeProfile.city || "Not shared"}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label>State</label>
              {edit ? (
                <input
                  className={styles.input}
                  value={activeProfile.state || ""}
                  onChange={(event) =>
                    updateField("state", event.target.value)
                  }
                />
              ) : (
                <p className={styles.inlineDetail}>
                  {activeProfile.state || "Not shared"}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label>Country</label>
              {edit ? (
                <input
                  className={styles.input}
                  value={activeProfile.country || ""}
                  onChange={(event) =>
                    updateField("country", event.target.value)
                  }
                />
              ) : (
                <p className={styles.inlineDetail}>
                  {activeProfile.country || "Not shared"}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label>Phone</label>
              {edit ? (
                <input
                  className={styles.input}
                  value={activeProfile.phone || ""}
                  onChange={(event) =>
                    updateField("phone", event.target.value)
                  }
                />
              ) : (
                <p className={styles.inlineDetail}>
                  {activeProfile.phone || "Not added"}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label>Preferred language</label>
              {edit ? (
                <input
                  className={styles.input}
                  value={activeProfile.preferredLanguage || ""}
                  onChange={(event) =>
                    updateField(
                      "preferredLanguage",
                      event.target.value
                    )
                  }
                />
              ) : (
                <p className={styles.inlineDetail}>
                  {activeProfile.preferredLanguage ||
                    "Not shared"}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label>Timezone</label>
              {edit ? (
                <input
                  className={styles.input}
                  value={activeProfile.timezone || ""}
                  onChange={(event) =>
                    updateField("timezone", event.target.value)
                  }
                />
              ) : (
                <p className={styles.inlineDetail}>
                  {activeProfile.timezone || "Not shared"}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      {activeProfile.isTutor ? (
        <>
          <div className={styles.contentGrid}>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.eyebrow}>Tutor</span>
                  <h2>Teaching profile</h2>
                  <p>
                    Everything students should understand before
                    they request time with you.
                  </p>
                </div>
              </div>

              <div className={styles.fieldGrid}>
                <div className={`${styles.field} ${styles.fieldWide}`}>
                  <label>Headline</label>
                  {edit ? (
                    <input
                      className={styles.input}
                      value={tutorProfile.headline || ""}
                      onChange={(event) =>
                        updateTutorField(
                          "headline",
                          event.target.value
                        )
                      }
                      placeholder="What kind of learning outcome do you help with?"
                    />
                  ) : (
                    <p className={styles.valueBlock}>
                      {tutorProfile.headline ||
                        "No tutor headline added yet."}
                    </p>
                  )}
                </div>

                <div className={`${styles.field} ${styles.fieldWide}`}>
                  <label>Tutor bio</label>
                  {edit ? (
                    <textarea
                      className={styles.textarea}
                      value={tutorProfile.bio || ""}
                      onChange={(event) =>
                        updateTutorField(
                          "bio",
                          event.target.value
                        )
                      }
                      placeholder="Describe how you teach and what learners can expect."
                    />
                  ) : (
                    <p className={styles.valueBlock}>
                      {tutorProfile.bio ||
                        "No tutor bio added yet."}
                    </p>
                  )}
                </div>

                <div className={styles.field}>
                  <label>Experience in years</label>
                  {edit ? (
                    <input
                      type="number"
                      min="0"
                      className={styles.input}
                      value={String(
                        tutorProfile.experience ?? 0
                      )}
                      onChange={(event) =>
                        updateTutorField(
                          "experience",
                          Number(event.target.value) || 0
                        )
                      }
                    />
                  ) : (
                    <p className={styles.inlineDetail}>
                      {tutorProfile.experience || 0} years
                    </p>
                  )}
                </div>

                <div className={styles.field}>
                  <label>Teaching mode</label>
                  {edit ? (
                    <select
                      className={styles.select}
                      value={tutorProfile.teachingMode || "Online"}
                      onChange={(event) =>
                        updateTutorField(
                          "teachingMode",
                          event.target.value
                        )
                      }
                    >
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="Both">Both</option>
                    </select>
                  ) : (
                    <p className={styles.inlineDetail}>
                      {tutorProfile.teachingMode || "Online"}
                    </p>
                  )}
                </div>

                <div className={`${styles.field} ${styles.fieldWide}`}>
                  <label>Experience details</label>
                  {edit ? (
                    <textarea
                      className={styles.textarea}
                      value={
                        tutorProfile.experienceDetails || ""
                      }
                      onChange={(event) =>
                        updateTutorField(
                          "experienceDetails",
                          event.target.value
                        )
                      }
                      placeholder="Share the projects, teaching contexts, or outcomes that make you credible."
                    />
                  ) : (
                    <p className={styles.valueBlock}>
                      {tutorProfile.experienceDetails ||
                        "No experience details added yet."}
                    </p>
                  )}
                </div>

                <div className={`${styles.field} ${styles.fieldWide}`}>
                  <label>Education</label>
                  {edit ? (
                    <textarea
                      className={styles.textarea}
                      value={tutorProfile.education || ""}
                      onChange={(event) =>
                        updateTutorField(
                          "education",
                          event.target.value
                        )
                      }
                      placeholder="Degrees, certifications, or notable study experience."
                    />
                  ) : (
                    <p className={styles.valueBlock}>
                      {tutorProfile.education ||
                        "No education details added yet."}
                    </p>
                  )}
                </div>

                <div className={styles.field}>
                  <label>Availability</label>
                  {edit ? (
                    <label className={styles.switchRow}>
                      <input
                        type="checkbox"
                        checked={
                          tutorProfile.availability || false
                        }
                        onChange={(event) =>
                          updateTutorField(
                            "availability",
                            event.target.checked
                          )
                        }
                      />
                      <span>
                        {tutorProfile.availability
                          ? "Available for requests"
                          : "Not available"}
                      </span>
                    </label>
                  ) : (
                    <p className={styles.inlineDetail}>
                      {tutorProfile.availability
                        ? "Available for requests"
                        : "Not available right now"}
                    </p>
                  )}
                </div>

                <div className={styles.field}>
                  <label>Public location</label>
                  <p className={styles.inlineDetail}>
                    {location || "No location shared yet"}
                  </p>
                </div>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.eyebrow}>Signals</span>
                  <h2>Skills and reach</h2>
                  <p>
                    Tags and supporting details that make your
                    profile easier to scan.
                  </p>
                </div>
              </div>

              <div className={styles.field}>
                <label>Skills</label>
                {tutorProfile.skills?.length ? (
                  <div className={styles.tagGroup}>
                    <AnimatePresence>
                      {tutorProfile.skills.map((skill) => (
                        <motion.div
                          key={skill}
                          variants={skillVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                          className={styles.tag}
                        >
                          {skill}
                          {edit ? (
                            <button
                              type="button"
                              className={styles.chipButton}
                              onClick={() =>
                                removeSkill(skill)
                              }
                            >
                              <X size={12} />
                            </button>
                          ) : null}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <p className={styles.emptyText}>
                    No skills added yet.
                  </p>
                )}

                {edit ? (
                  <div className={styles.skillComposer}>
                    <input
                      className={styles.input}
                      value={skillInput}
                      onChange={(event) =>
                        setSkillInput(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="Add a skill and press Enter"
                    />
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={addSkill}
                    >
                      Add skill
                    </button>
                  </div>
                ) : null}
              </div>

              <div className={styles.field}>
                <label>Categories</label>
                {edit ? (
                  <textarea
                    className={styles.textarea}
                    value={(tutorProfile.categories || []).join(
                      ", "
                    )}
                    onChange={(event) =>
                      updateTutorList(
                        "categories",
                        event.target.value
                      )
                    }
                    placeholder="Separate categories with commas"
                  />
                ) : tutorProfile.categories?.length ? (
                  <div className={styles.tagGroup}>
                    {tutorProfile.categories.map((category) => (
                      <span key={category} className={styles.tag}>
                        {category}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyText}>
                    No categories added yet.
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <label>Languages</label>
                {edit ? (
                  <textarea
                    className={styles.textarea}
                    value={(tutorProfile.languages || []).join(
                      ", "
                    )}
                    onChange={(event) =>
                      updateTutorList(
                        "languages",
                        event.target.value
                      )
                    }
                    placeholder="Separate languages with commas"
                  />
                ) : tutorProfile.languages?.length ? (
                  <div className={styles.tagGroup}>
                    {tutorProfile.languages.map((language) => (
                      <span key={language} className={styles.tag}>
                        {language}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyText}>
                    No teaching languages added yet.
                  </p>
                )}
              </div>
            </section>
          </div>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.eyebrow}>Portfolio</span>
                <h2>Links and proof of work</h2>
                <p>
                  Add destinations students can use to validate
                  your teaching background.
                </p>
              </div>
            </div>

            <div className={styles.field}>
              <label>Portfolio links</label>
              {edit ? (
                <textarea
                  className={styles.textarea}
                  value={(tutorProfile.portfolioLinks || []).join(
                    "\n"
                  )}
                  onChange={(event) =>
                    updateTutorList(
                      "portfolioLinks",
                      event.target.value
                    )
                  }
                  placeholder="One link per line or separated by commas"
                />
              ) : tutorProfile.portfolioLinks?.length ? (
                <div className={styles.linkList}>
                  {tutorProfile.portfolioLinks.map((link) => (
                    <a
                      key={link}
                      className={styles.portfolioLink}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Link2 size={15} />
                      <span>{link}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyText}>
                  No portfolio links added yet.
                </p>
              )}
            </div>
          </section>
        </>
      ) : null}

      <div className={styles.footerGrid}>
        <div className={styles.infoStrip}>
          <Globe2 size={16} />
          <span>
            {activeProfile.timezone ||
              "Timezone not shared yet"}
          </span>
        </div>
        <div className={styles.infoStrip}>
          <BookOpenText size={16} />
          <span>
            {activeProfile.preferredLanguage ||
              "Preferred language not set"}
          </span>
        </div>
        <div className={styles.infoStrip}>
          <GraduationCap size={16} />
          <span>
            {activeProfile.isTutor
              ? tutorProfile.education ||
                "Education details not added yet"
              : "Add tutor details if you decide to teach"}
          </span>
        </div>
        <div className={styles.infoStrip}>
          <Clock3 size={16} />
          <span>
            {activeProfile.isTutor
              ? `${
                  tutorProfile.totalSessions || 0
                } completed sessions`
              : "Track bookings from the dashboard"}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
