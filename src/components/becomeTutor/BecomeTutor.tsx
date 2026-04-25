import React, { useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import styles from "./BecomeTutor.module.scss";
import { becomeTutor } from "../../services/profile.service";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import SkillsInput from "./SkillsInput";
import CategorySelect from "./CategorySelect";

const BecomeTutor: React.FC = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

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
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

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

    setLoading(true);
    setError("");

    if (!form.headline.trim()) {
      setError("Headline is required.");
      setLoading(false);
      return;
    }

    if (!form.bio || form.bio.length < 20) {
      setError("Bio must be at least 20 characters.");
      setLoading(false);
      return;
    }

    if (form.skills.length < 2) {
      setError("Add at least 2 skills.");
      setLoading(false);
      return;
    }

    if (form.categories.length === 0) {
      setError("Select at least 1 category.");
      setLoading(false);
      return;
    }

    if (form.availability === null) {
      setError("Please choose your availability.");
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
      await becomeTutor(payload);

      setUser((previous) =>
        previous
          ? {
              ...previous,
              isTutor: true,
            }
          : previous
      );

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
            {form.skills.length} skills | {form.categories.length}{" "}
            categories
          </strong>
          <span className={styles.snapshotHint}>
            Clear profiles convert better than sparse ones.
          </span>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Your tutor profile</h2>
            <p>
              These details will feed into your public profile and
              dashboard surfaces.
            </p>
          </div>
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.fieldGrid}>
          <label className={`${styles.field} ${styles.fieldWide}`}>
            <span>Headline</span>
            <input
              name="headline"
              value={form.headline}
              onChange={handleChange}
              placeholder="What outcome do you help learners achieve?"
              required
            />
          </label>

          <label className={`${styles.field} ${styles.fieldWide}`}>
            <span>Bio</span>
            <textarea
              name="bio"
              value={form.bio}
              placeholder="Describe your teaching style, experience, and strengths."
              onChange={handleChange}
              required
            />
          </label>

          <div className={styles.field}>
            <span>Skills</span>
            <SkillsInput
              value={form.skills}
              onChange={(skills) =>
                setForm((previous) => ({ ...previous, skills }))
              }
            />
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
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
        >
          <Sparkles size={16} />
          {loading ? "Submitting..." : "Become a tutor"}
        </button>
      </form>

      {showSuccess ? (
        <div className={styles.successOverlay}>
          <div className={styles.successModal}>
            <div className={styles.checkmark}>
              <CheckCircle2 size={28} />
            </div>
            <h2>You are now a tutor</h2>
            <p>Redirecting to your dashboard...</p>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default BecomeTutor;
