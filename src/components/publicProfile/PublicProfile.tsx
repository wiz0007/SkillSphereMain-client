import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./PublicProfile.module.scss";
import { motion } from "framer-motion";
import {
  BookOpenText,
  BriefcaseBusiness,
  Clock3,
  Globe2,
  GraduationCap,
  Languages,
  Link2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { getPublicProfile } from "../../services/profile.service";

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

interface PublicProfileData {
  username?: string;
  fullName?: string;
  bio?: string;
  profilePhoto?: string;
  city?: string;
  state?: string;
  country?: string;
  preferredLanguage?: string;
  timezone?: string;
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

const PublicProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] =
    useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const data = await getPublicProfile(userId);
        setProfile(data);
      } catch (error) {
        console.error("Failed to load public profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const profileStats = useMemo(() => {
    if (!profile) return [];

    const tutor = profile.tutorProfile || EMPTY_TUTOR_PROFILE;
    const location = [
      profile.city,
      profile.state,
      profile.country,
    ]
      .filter(Boolean)
      .join(", ");

    const baseStats = [
      {
        label: "Location",
        value: location || "Location not shared",
        meta: profile.timezone || "Timezone not shared",
        icon: MapPin,
      },
      {
        label: "Language",
        value:
          profile.preferredLanguage ||
          tutor.languages?.[0] ||
          "Not shared",
        meta: tutor.languages?.length
          ? `${tutor.languages.length} listed languages`
          : "Language details are limited",
        icon: Languages,
      },
    ];

    if (!profile.isTutor) {
      return [
        ...baseStats,
        {
          label: "Profile",
          value: "Learner profile",
          meta: "No public tutor details available",
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
          ? "Accepting session requests"
          : "Currently unavailable",
        icon: BriefcaseBusiness,
      },
      {
        label: "Reputation",
        value: tutor.totalSessions
          ? `${tutor.totalSessions} sessions`
          : "New tutor",
        meta: tutor.rating
          ? `${tutor.rating.toFixed(1)} average rating`
          : "Rating still building",
        icon: Star,
      },
    ];
  }, [profile]);

  if (loading) {
    return (
      <div className={styles.loader}>
        Loading public profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.loader}>
        This profile is not available right now.
      </div>
    );
  }

  const tutorProfile =
    profile.tutorProfile || EMPTY_TUTOR_PROFILE;

  const location = [
    profile.city,
    profile.state,
    profile.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className={styles.header}>
        <div className={styles.heroCard}>
          <span className={styles.kicker}>Public Profile</span>

          <div className={styles.identity}>
            <img
              className={styles.avatar}
              src={
                profile.profilePhoto ||
                "https://i.pravatar.cc/160"
              }
              alt={profile.fullName || profile.username || "Tutor"}
            />

            <div className={styles.headerCopy}>
              <div className={styles.badgeRow}>
                {profile.isTutor ? (
                  <span className={styles.badge}>Tutor</span>
                ) : null}
                {profile.isTutor &&
                tutorProfile.isVerified ? (
                  <span
                    className={`${styles.badge} ${styles.ghostBadge}`}
                  >
                    <ShieldCheck size={14} />
                    Verified
                  </span>
                ) : null}
              </div>

              <h1>
                {profile.fullName ||
                  (profile.username
                    ? `@${profile.username}`
                    : "Public profile")}
              </h1>

              {profile.username ? (
                <p className={styles.headerMeta}>
                  @{profile.username}
                </p>
              ) : null}

              <p className={styles.summary}>
                {profile.isTutor
                  ? tutorProfile.headline ||
                    tutorProfile.bio ||
                    profile.bio ||
                    "This tutor has not added a public teaching summary yet."
                  : profile.bio ||
                    "No public bio shared yet."}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.snapshot}>
          <span className={styles.snapshotLabel}>Overview</span>
          <strong>
            {profile.isTutor
              ? tutorProfile.availability
                ? "Available for learning requests and profile discovery."
                : "Profile is visible but currently not taking new requests."
              : "General account profile with limited public teaching data."}
          </strong>
          <span className={styles.snapshotHint}>
            {profile.isTutor
              ? `${tutorProfile.experience || 0} years experience | ${
                  tutorProfile.skills?.length || 0
                } skills listed`
              : location || "Location has not been shared publicly"}
          </span>
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
              <h2>About</h2>
              <p>
                A quick sense of who this person is and how
                they present themselves publicly.
              </p>
            </div>
          </div>

          <div className={styles.copyStack}>
            <p className={styles.valueBlock}>
              {profile.bio ||
                "No personal bio has been shared publicly."}
            </p>

            {profile.isTutor ? (
              <p className={styles.valueBlock}>
                {tutorProfile.bio ||
                  "No dedicated tutor bio has been shared yet."}
              </p>
            ) : null}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.eyebrow}>Details</span>
              <h2>Profile details</h2>
              <p>
                Core details students usually want to scan
                before making contact.
              </p>
            </div>
          </div>

          <div className={styles.detailList}>
            <div className={styles.detailRow}>
              <MapPin size={16} />
              <div>
                <span>Location</span>
                <strong>
                  {location || "Location not shared"}
                </strong>
              </div>
            </div>

            <div className={styles.detailRow}>
              <Globe2 size={16} />
              <div>
                <span>Timezone</span>
                <strong>
                  {profile.timezone || "Not shared"}
                </strong>
              </div>
            </div>

            <div className={styles.detailRow}>
              <Languages size={16} />
              <div>
                <span>Preferred language</span>
                <strong>
                  {profile.preferredLanguage || "Not shared"}
                </strong>
              </div>
            </div>

            {profile.isTutor ? (
              <>
                <div className={styles.detailRow}>
                  <BriefcaseBusiness size={16} />
                  <div>
                    <span>Teaching mode</span>
                    <strong>
                      {tutorProfile.teachingMode || "Online"}
                    </strong>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <Clock3 size={16} />
                  <div>
                    <span>Availability</span>
                    <strong>
                      {tutorProfile.availability
                        ? "Available for requests"
                        : "Unavailable right now"}
                    </strong>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <GraduationCap size={16} />
                  <div>
                    <span>Education</span>
                    <strong>
                      {tutorProfile.education ||
                        "Education details not shared"}
                    </strong>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </section>
      </div>

      {profile.isTutor ? (
        <div className={styles.contentGrid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.eyebrow}>Expertise</span>
                <h2>Skills and categories</h2>
                <p>
                  Teaching areas highlighted on this public
                  profile.
                </p>
              </div>
            </div>

            <div className={styles.fieldBlock}>
              <label>Skills</label>
              {tutorProfile.skills?.length ? (
                <div className={styles.tagGroup}>
                  {tutorProfile.skills.map((skill) => (
                    <span key={skill} className={styles.tag}>
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyText}>
                  No skills shared yet.
                </p>
              )}
            </div>

            <div className={styles.fieldBlock}>
              <label>Categories</label>
              {tutorProfile.categories?.length ? (
                <div className={styles.tagGroup}>
                  {tutorProfile.categories.map((category) => (
                    <span key={category} className={styles.tag}>
                      {category}
                    </span>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyText}>
                  No categories shared yet.
                </p>
              )}
            </div>

            <div className={styles.fieldBlock}>
              <label>Languages</label>
              {tutorProfile.languages?.length ? (
                <div className={styles.tagGroup}>
                  {tutorProfile.languages.map((language) => (
                    <span key={language} className={styles.tag}>
                      {language}
                    </span>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyText}>
                  No teaching languages shared yet.
                </p>
              )}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.eyebrow}>Background</span>
                <h2>Teaching context</h2>
                <p>
                  The story behind the experience and public
                  teaching credibility.
                </p>
              </div>
            </div>

            <div className={styles.copyStack}>
              <div className={styles.infoTile}>
                <BookOpenText size={16} />
                <div>
                  <span>Experience</span>
                  <strong>
                    {tutorProfile.experience || 0} years
                  </strong>
                </div>
              </div>

              <p className={styles.valueBlock}>
                {tutorProfile.experienceDetails ||
                  "No experience details shared yet."}
              </p>

              <div className={styles.infoTile}>
                <Star size={16} />
                <div>
                  <span>Session history</span>
                  <strong>
                    {tutorProfile.totalSessions || 0} completed
                    sessions
                  </strong>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {profile.isTutor ? (
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.eyebrow}>Portfolio</span>
              <h2>External links</h2>
              <p>
                Additional places to verify work, background,
                or teaching examples.
              </p>
            </div>
          </div>

          {tutorProfile.portfolioLinks?.length ? (
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
              No external links shared yet.
            </p>
          )}
        </section>
      ) : null}
    </motion.div>
  );
};

export default PublicProfile;
