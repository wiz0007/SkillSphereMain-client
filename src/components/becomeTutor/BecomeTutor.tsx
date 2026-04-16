import React, { useState } from "react";
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

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    /* ================= VALIDATION ================= */

    if (!form.headline.trim()) {
      setError("Headline is required");
      setLoading(false);
      return;
    }

    if (!form.bio || form.bio.length < 20) {
      setError("Bio must be at least 20 characters");
      setLoading(false);
      return;
    }

    if (form.skills.length < 2) {
      setError("Add at least 2 skills");
      setLoading(false);
      return;
    }

    if (form.categories.length === 0) {
      setError("Select at least 1 category");
      setLoading(false);
      return;
    }

    if (form.availability === null) {
      setError("Please select availability");
      setLoading(false);
      return;
    }

    /* ================= PAYLOAD ================= */

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
        .map((s) => s.trim())
        .filter(Boolean),

      languages: form.languages
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),

      availability: form.availability,
      teachingMode: form.teachingMode || "Online",
    };

    try {
      await becomeTutor(payload);

      setUser((prev) =>
        prev
          ? {
              ...prev,
              isTutor: true,
            }
          : prev
      );

      setShowSuccess(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1800);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* HERO */}
      <section className={styles.hero}>
        <h1>Become a Tutor</h1>
        <p>Share your skills and earn money 🚀</p>
      </section>

      {/* FORM */}
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Your Tutor Profile</h2>

        {error && <p className={styles.error}>{error}</p>}

        {/* HEADLINE */}
        <div className={styles.field}>
          <label>Headline</label>
          <input
            name="headline"
            value={form.headline}
            onChange={handleChange}
            required
          />
        </div>

        {/* BIO */}
        <div className={styles.field}>
          <label>Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            placeholder="Describe your teaching style, experience, and strengths"
            onChange={handleChange}
            required
          />
        </div>

        {/* SKILLS */}
        <div className={styles.field}>
          <label>Skills</label>
          <SkillsInput
            value={form.skills}
            onChange={(skills) =>
              setForm((prev) => ({ ...prev, skills }))
            }
          />
        </div>

        {/* CATEGORIES */}
        <div className={styles.field}>
          <label>Categories</label>
          <CategorySelect
            value={form.categories}
            onChange={(categories) =>
              setForm((prev) => ({ ...prev, categories }))
            }
          />
        </div>

        {/* EXPERIENCE */}
        <div className={styles.field}>
          <label>Experience (years)</label>
          <input
            name="experience"
            type="number"
            onChange={handleChange}
          />
        </div>

        {/* EXPERIENCE DETAILS */}
        <div className={styles.field}>
          <label>Experience Details</label>
          <textarea
            name="experienceDetails"
            placeholder="Worked at X, built Y, mentored Z students..."
            onChange={handleChange}
          />
        </div>

        {/* EDUCATION */}
        <div className={styles.field}>
          <label>Education</label>
          <input
            name="education"
            placeholder="Degree, University, or Self-taught"
            onChange={handleChange}
          />
        </div>

        {/* PORTFOLIO */}
        <div className={styles.field}>
          <label>Portfolio / Professional Links</label>
          <input
            name="portfolioLinks"
            placeholder="GitHub, LinkedIn, Portfolio URL"
            onChange={handleChange}
          />
        </div>

        {/* LANGUAGES */}
        <div className={styles.field}>
          <label>Languages</label>
          <input
            name="languages"
            placeholder="English, Hindi"
            onChange={handleChange}
          />
        </div>

        {/* AVAILABILITY */}
        <div className={styles.field}>
          <label>Currently Available?</label>

          <div style={{ display: "flex", gap: "1rem" }}>
            <label>
              <input
                type="radio"
                checked={form.availability === true}
                onChange={() =>
                  setForm((prev) => ({
                    ...prev,
                    availability: true,
                  }))
                }
              />
              Yes
            </label>

            <label>
              <input
                type="radio"
                checked={form.availability === false}
                onChange={() =>
                  setForm((prev) => ({
                    ...prev,
                    availability: false,
                  }))
                }
              />
              No
            </label>
          </div>
        </div>

        {/* TEACHING MODE */}
        <div className={styles.field}>
          <label>Teaching Mode</label>
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
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Become Tutor 🚀"}
        </button>
      </form>

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className={styles.successOverlay}>
          <div className={styles.successModal}>
            <div className={styles.checkmark}>✓</div>
            <h2>You are now a Tutor!</h2>
            <p>Redirecting to dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BecomeTutor;