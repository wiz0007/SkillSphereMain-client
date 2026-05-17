import React, { useEffect, useMemo, useRef, useState } from "react";
import { BadgeCheck, CheckCircle2, CircleAlert, ShieldCheck, Sparkles, Upload } from "lucide-react";
import styles from "./BecomeTutor.module.scss";
import {
  becomeTutor,
  getMyProfile,
  getVerificationSummary,
  submitTutorVerification,
} from "../../services/profile.service";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import SkillsInput from "./SkillsInput";
import CategorySelect from "./CategorySelect";

const BecomeTutor: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const isAdmin = !!user?.isAdmin;

  const [form, setForm] = useState({
    headline: "",
    bio: "",
    skills: [] as string[],
    categories: [] as string[],
    experience: "",
    experienceDetails: "",
    education: "",
    portfolioLinks: "",
    languages: "",
    availability: null as boolean | null,
    teachingMode: "",
  });

  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successCopy, setSuccessCopy] = useState({
    title: "Tutor profile updated",
    message: "Redirecting to your dashboard...",
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [supportingDocument, setSupportingDocument] = useState<File | null>(null);
  const [verificationNote, setVerificationNote] = useState("");
  const [verificationSummary, setVerificationSummary] = useState<{
    emailVerified: boolean;
    identityVerificationStatus:
      | "not_started"
      | "pending"
      | "approved"
      | "rejected"
      | "resubmission_required";
    tutorVerificationStatus:
      | "not_started"
      | "pending"
      | "approved"
      | "rejected"
      | "resubmission_required";
    verifiedBadgeLevel: "none" | "basic" | "identity" | "tutor";
  } | null>(null);

  const headlineRef = useRef<HTMLInputElement | null>(null);
  const bioRef = useRef<HTMLTextAreaElement | null>(null);

  const validationErrors = useMemo(
    () => ({
      headline: !form.headline.trim() ? "Headline is required." : "",
      bio:
        !form.bio.trim() || form.bio.trim().length < 20
          ? "Bio must be at least 20 characters."
          : "",
      skills:
        form.skills.length < 2 ? "Add at least 2 skills." : "",
      categories:
        form.categories.length === 0
          ? "Select at least 1 category."
          : "",
      availability:
        form.availability === null
          ? "Please choose your availability."
          : "",
      supportingDocument:
        !isAdmin &&
        verificationSummary?.identityVerificationStatus === "approved" &&
        !["approved", "pending"].includes(
          verificationSummary?.tutorVerificationStatus || "not_started"
        ) &&
        !supportingDocument
          ? "Upload a supporting document for tutor verification."
          : "",
    }),
    [
      form.availability,
      form.bio,
      form.categories.length,
      form.headline,
      form.skills.length,
      isAdmin,
      supportingDocument,
      verificationSummary?.tutorVerificationStatus,
    ]
  );

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setBootstrapping(true);
        const [profile, verification] = await Promise.all([
          getMyProfile(),
          getVerificationSummary(),
        ]);

        setForm((previous) => ({
          ...previous,
          headline: profile?.tutorProfile?.headline || previous.headline,
          bio: profile?.tutorProfile?.bio || previous.bio,
          skills: profile?.tutorProfile?.skills || previous.skills,
          categories: profile?.tutorProfile?.categories || previous.categories,
          experience: String(profile?.tutorProfile?.experience ?? previous.experience),
          experienceDetails:
            profile?.tutorProfile?.experienceDetails || previous.experienceDetails,
          education: profile?.tutorProfile?.education || previous.education,
          portfolioLinks: Array.isArray(profile?.tutorProfile?.portfolioLinks)
            ? profile.tutorProfile.portfolioLinks.join(", ")
            : previous.portfolioLinks,
          languages: Array.isArray(profile?.tutorProfile?.languages)
            ? profile.tutorProfile.languages.join(", ")
            : previous.languages,
          availability:
            typeof profile?.tutorProfile?.availability === "boolean"
              ? profile.tutorProfile.availability
              : previous.availability,
          teachingMode:
            profile?.tutorProfile?.teachingMode || previous.teachingMode,
        }));

        setVerificationSummary(verification.summary);
      } catch (nextError) {
        console.error("Failed to bootstrap tutor form:", nextError);
      } finally {
        setBootstrapping(false);
      }
    };

    void bootstrap();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitAttempted(true);

    setLoading(true);
    setError("");

    if (validationErrors.headline) {
      setError(validationErrors.headline);
      headlineRef.current?.focus();
      setLoading(false);
      return;
    }

    if (validationErrors.bio) {
      setError(validationErrors.bio);
      bioRef.current?.focus();
      setLoading(false);
      return;
    }

    if (validationErrors.skills) {
      setError(validationErrors.skills);
      setLoading(false);
      return;
    }

    if (validationErrors.categories) {
      setError(validationErrors.categories);
      setLoading(false);
      return;
    }

    if (validationErrors.availability) {
      setError(validationErrors.availability);
      setLoading(false);
      return;
    }

    if (validationErrors.supportingDocument) {
      setError(validationErrors.supportingDocument);
      setLoading(false);
      return;
    }

    const payload = {
      headline: form.headline,
      bio: form.bio,
      skills: form.skills,
      categories: form.categories,
      experience: Number(form.experience) || 0,
      experienceDetails: form.experienceDetails,
      education: form.education,
      portfolioLinks: form.portfolioLinks
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      languages: form.languages
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      availability: form.availability,
      teachingMode: form.teachingMode || "Online",
    };

    try {
      const profileResponse = await becomeTutor(payload);

      setUser((previous) =>
        previous
          ? {
              ...previous,
              isTutor: true,
            }
          : previous
      );

      const identityApproved =
        isAdmin ||
        verificationSummary?.identityVerificationStatus === "approved";
      const tutorAlreadyApproved =
        isAdmin ||
        verificationSummary?.tutorVerificationStatus === "approved";

      if (!isAdmin && identityApproved && !tutorAlreadyApproved && supportingDocument) {
        const verificationResponse = await submitTutorVerification({
          note: verificationNote,
          supportingDocument,
        });

        setVerificationSummary(verificationResponse.summary);
        setUser((previous) =>
          previous
            ? {
                ...previous,
                isTutor: true,
                identityVerificationStatus:
                  verificationResponse.summary.identityVerificationStatus,
                tutorVerificationStatus:
                  verificationResponse.summary.tutorVerificationStatus,
                verifiedBadgeLevel:
                  verificationResponse.summary.verifiedBadgeLevel,
              }
            : previous
        );

        setSuccessCopy({
          title: "Tutor verification submitted",
          message:
            "Your tutor profile is live and your badge request is now pending admin review.",
        });
      } else if (!identityApproved) {
        setUser((previous) =>
          previous
            ? {
                ...previous,
                isTutor: true,
              }
            : previous
        );

        setSuccessCopy({
          title: "Tutor profile saved",
          message:
            "Complete identity verification from your profile to unlock tutor badge review.",
        });
      } else {
        setVerificationSummary((previous) =>
          previous
            ? {
                ...previous,
                tutorVerificationStatus: previous.tutorVerificationStatus,
              }
            : previous
        );
        setUser((previous) =>
          previous
            ? {
                ...previous,
                isTutor: true,
                tutorVerificationStatus:
                  profileResponse?.tutorVerificationStatus ||
                  previous.tutorVerificationStatus,
              }
            : previous
        );
        setSuccessCopy({
          title: isAdmin
            ? "Admin tutor profile updated"
            : tutorAlreadyApproved
            ? "Tutor profile updated"
            : "Tutor profile saved",
          message: isAdmin
            ? "Admin accounts can manage tutor details without needing verification approval."
            : tutorAlreadyApproved
            ? "Your verified tutor profile changes have been saved."
            : "Your tutor profile has been updated.",
        });
      }

      setShowSuccess(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1800);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>Tutor Onboarding</span>
          <h1>Turn your profile into a tutor-ready workspace.</h1>
          <p>
            Add the signals learners need to trust your expertise,
            request sessions, and understand your teaching style at
            a glance.
          </p>
        </div>

        <div className={styles.snapshot}>
          <span className={styles.snapshotLabel}>Progress</span>
          <strong>
            {isAdmin
              ? "Admin account active"
              : verificationSummary?.tutorVerificationStatus === "approved"
              ? "Verified tutor badge active"
              : verificationSummary?.tutorVerificationStatus === "pending"
                ? "Tutor verification pending"
                : `${form.skills.length} skills | ${form.categories.length} categories`}
          </strong>
          <span className={styles.snapshotHint}>
            {isAdmin
              ? "Admin accounts are exempt from user and tutor verification review."
              : verificationSummary?.identityVerificationStatus === "approved"
              ? "Identity verified. Submit or maintain tutor docs for the badge."
              : "Identity approval is required before the tutor badge can be granted."}
          </span>
        </div>
      </div>

      {bootstrapping ? (
        <div className={styles.form}>
          Loading tutor setup...
        </div>
      ) : null}

      {!bootstrapping ? (
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>
              {verificationSummary?.tutorVerificationStatus === "approved"
                ? "Your verified tutor profile"
                : "Your tutor profile"}
            </h2>
            <p>
              These details feed into your public profile. Tutor badge review now starts from this same workflow.
            </p>
          </div>
        </div>

        <div className={styles.statusGrid}>
          <div className={styles.statusCard}>
            <span>Identity verification</span>
            <strong>{verificationSummary?.identityVerificationStatus?.replaceAll("_", " ") || "not started"}</strong>
          </div>
          <div className={styles.statusCard}>
            <span>Tutor verification</span>
            <strong>{verificationSummary?.tutorVerificationStatus?.replaceAll("_", " ") || "not started"}</strong>
          </div>
          <div className={styles.statusCard}>
            <span>Visible trust mark</span>
            <strong>
              {isAdmin
                ? "Admin badge"
                : verificationSummary?.tutorVerificationStatus === "approved"
                ? "Tutor badge"
                : ["identity", "tutor"].includes(
                    verificationSummary?.verifiedBadgeLevel || "none"
                  )
                  ? "Blue tick"
                  : "No badge yet"}
            </strong>
          </div>
        </div>

        {isAdmin ? (
          <div className={styles.infoBanner}>
            <ShieldCheck size={18} />
            <span>
              Admin accounts can edit tutor-facing profile details without submitting identity or tutor verification proof.
            </span>
          </div>
        ) : verificationSummary?.tutorVerificationStatus !== "approved" ? (
          <div className={styles.infoBanner}>
            {verificationSummary?.identityVerificationStatus === "approved" ? (
              <>
                <BadgeCheck size={18} />
                <span>
                  Your identity is already approved. Upload supporting tutor proof below to request the tutor badge.
                </span>
              </>
            ) : (
              <>
                <CircleAlert size={18} />
                <span>
                  Identity verification must be approved before the tutor badge can be granted. You can still save your tutor profile now.
                </span>
              </>
            )}
          </div>
        ) : (
          <div className={styles.infoBanner}>
            <ShieldCheck size={18} />
            <span>
              Your tutor badge is active. Update this profile any time without losing the verified status.
            </span>
          </div>
        )}

        {error ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.fieldGrid}>
          <label className={`${styles.field} ${styles.fieldWide}`}>
            <span>Headline</span>
            <input
              ref={headlineRef}
              name="headline"
              value={form.headline}
              onChange={handleChange}
              placeholder="What outcome do you help learners achieve?"
              className={
                submitAttempted && validationErrors.headline
                  ? styles.inputError
                  : undefined
              }
            />
            {submitAttempted && validationErrors.headline ? (
              <small className={styles.errorText}>
                {validationErrors.headline}
              </small>
            ) : null}
          </label>

          <label className={`${styles.field} ${styles.fieldWide}`}>
            <span>Bio</span>
            <textarea
              ref={bioRef}
              name="bio"
              value={form.bio}
              placeholder="Describe your teaching style, experience, and strengths."
              onChange={handleChange}
              className={
                submitAttempted && validationErrors.bio
                  ? styles.inputError
                  : undefined
              }
            />
            {submitAttempted && validationErrors.bio ? (
              <small className={styles.errorText}>
                {validationErrors.bio}
              </small>
            ) : null}
          </label>

          <div className={styles.field}>
            <span>Skills</span>
            <SkillsInput
              value={form.skills}
              onChange={(skills) =>
                setForm((previous) => ({ ...previous, skills }))
              }
            />
            {submitAttempted && validationErrors.skills ? (
              <small className={styles.errorText}>
                {validationErrors.skills}
              </small>
            ) : null}
          </div>

          <div className={styles.field}>
            <span>Categories</span>
            <CategorySelect
              value={form.categories}
              onChange={(categories) =>
                setForm((previous) => ({
                  ...previous,
                  categories,
                }))
              }
            />
            {submitAttempted && validationErrors.categories ? (
              <small className={styles.errorText}>
                {validationErrors.categories}
              </small>
            ) : null}
          </div>

          <label className={styles.field}>
            <span>Experience in years</span>
            <input
              name="experience"
              type="number"
              value={form.experience}
              onChange={handleChange}
              placeholder="3"
            />
          </label>

          <label className={styles.field}>
            <span>Teaching mode</span>
            <select
              name="teachingMode"
              value={form.teachingMode}
              onChange={handleChange}
            >
              <option value="">Select mode</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Both">Both</option>
            </select>
          </label>

          <label className={`${styles.field} ${styles.fieldWide}`}>
            <span>Experience details</span>
            <textarea
              name="experienceDetails"
              value={form.experienceDetails}
              placeholder="Share notable work, projects, mentoring, or outcomes."
              onChange={handleChange}
            />
          </label>

          <label className={styles.field}>
            <span>Education</span>
            <input
              name="education"
              value={form.education}
              placeholder="Degree, certification, or self-taught background"
              onChange={handleChange}
            />
          </label>

          <label className={styles.field}>
            <span>Languages</span>
            <input
              name="languages"
              value={form.languages}
              placeholder="English, Hindi"
              onChange={handleChange}
            />
          </label>

          <label className={`${styles.field} ${styles.fieldWide}`}>
            <span>Portfolio or professional links</span>
            <input
              name="portfolioLinks"
              value={form.portfolioLinks}
              placeholder="GitHub, LinkedIn, portfolio URL"
              onChange={handleChange}
            />
          </label>

          <div className={`${styles.field} ${styles.fieldWide}`}>
            <span>Availability</span>
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  checked={form.availability === true}
                  onChange={() =>
                    setForm((previous) => ({
                      ...previous,
                      availability: true,
                    }))
                  }
                />
                <span>Available for requests</span>
              </label>

              <label className={styles.radioOption}>
                <input
                  type="radio"
                  checked={form.availability === false}
                  onChange={() =>
                    setForm((previous) => ({
                      ...previous,
                      availability: false,
                    }))
                  }
                />
                <span>Not available right now</span>
              </label>
            </div>
            {submitAttempted && validationErrors.availability ? (
              <small className={styles.errorText}>
                {validationErrors.availability}
              </small>
            ) : null}
          </div>

          {!isAdmin ? (
          <div className={`${styles.field} ${styles.fieldWide}`}>
            <span>Supporting tutor document</span>
            <label
              className={`${styles.uploadField} ${
                submitAttempted && validationErrors.supportingDocument
                  ? styles.inputError
                  : ""
              }`}
            >
              <Upload size={18} />
              <div>
                <strong>
                  {supportingDocument?.name ||
                    "Upload certificate, resume, portfolio proof, or teaching credential"}
                </strong>
                <small>
                  {verificationSummary?.tutorVerificationStatus === "approved"
                    ? "Optional when updating a verified tutor profile."
                    : "Required for tutor badge review."}
                </small>
              </div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                hidden
                onChange={(event) =>
                  setSupportingDocument(event.target.files?.[0] || null)
                }
              />
            </label>
            {submitAttempted && validationErrors.supportingDocument ? (
              <small className={styles.errorText}>
                {validationErrors.supportingDocument}
              </small>
            ) : null}
          </div>
          ) : null}

          {!isAdmin ? (
          <label className={`${styles.field} ${styles.fieldWide}`}>
            <span>Note for reviewer</span>
            <textarea
              name="verificationNote"
              value={verificationNote}
              placeholder="Mention certifications, teaching experience, portfolio context, or anything an admin should know."
              onChange={(event) => setVerificationNote(event.target.value)}
            />
          </label>
          ) : null}
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
        >
          <Sparkles size={16} />
          {loading
            ? "Submitting..."
            : isAdmin
              ? "Save admin tutor profile"
              : verificationSummary?.tutorVerificationStatus === "approved"
              ? "Save tutor profile"
              : "Save profile and request tutor verification"}
        </button>
      </form>
      ) : null}

      {showSuccess ? (
        <div className={styles.successOverlay}>
          <div className={styles.successModal}>
            <div className={styles.checkmark}>
              <CheckCircle2 size={28} />
            </div>
            <h2>{successCopy.title}</h2>
            <p>{successCopy.message}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default BecomeTutor;
