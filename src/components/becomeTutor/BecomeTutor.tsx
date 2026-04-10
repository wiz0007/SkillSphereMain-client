import React, { useState } from "react";
import styles from "./BecomeTutor.module.scss";
import { becomeTutor } from "../../services/profile.service";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

/* ================= COMPONENT ================= */

const BecomeTutor: React.FC = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    headline: "",
    skills: "",
    categories: "",
    experience: "",
    hourlyRate: "",
    languages: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ success modal control
  const [showSuccess, setShowSuccess] = useState(false);

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const payload = {
        headline: form.headline,
        experience: Number(form.experience) || 0,
        hourlyRate: Number(form.hourlyRate),

        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),

        categories: form.categories
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),

        languages: form.languages
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      await becomeTutor(payload);

      // ✅ Update auth (triggers navbar refresh automatically)
      setUser((prev) =>
        prev
          ? {
              ...prev,
              isTutor: true,
            }
          : prev
      );

      // ✅ Show success modal
      setShowSuccess(true);

      // ✅ Redirect after delay
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

        <div className={styles.field}>
          <label>Headline</label>
          <input name="headline" onChange={handleChange} required />
        </div>

        <div className={styles.field}>
          <label>Skills</label>
          <input
            name="skills"
            placeholder="React, Node, Python"
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.field}>
          <label>Categories</label>
          <input
            name="categories"
            placeholder="Web Dev, AI"
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.field}>
          <label>Experience (years)</label>
          <input
            name="experience"
            type="number"
            onChange={handleChange}
          />
        </div>

        <div className={styles.field}>
          <label>Hourly Rate (₹)</label>
          <input
            name="hourlyRate"
            type="number"
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.field}>
          <label>Languages</label>
          <input
            name="languages"
            placeholder="English, Hindi"
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Become Tutor 🚀"}
        </button>
      </form>

      {/* ================= SUCCESS MODAL ================= */}

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