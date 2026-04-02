import React, { useState } from "react";
import styles from "./BecomeTutor.module.scss";
import { becomeTutorAPI } from "../../services/profile.service";
import { useAuth } from "../../context/AuthContext";

const BecomeTutor: React.FC = () => {
  const { setUser } = useAuth();

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
  const [success, setSuccess] = useState("");

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        headline: form.headline,
        experience: Number(form.experience),
        hourlyRate: Number(form.hourlyRate),

        // 🔥 Convert to arrays
        skills: form.skills.split(",").map((s) => s.trim()),
        categories: form.categories.split(",").map((s) => s.trim()),
        languages: form.languages.split(",").map((s) => s.trim()),
      };

      const res = await becomeTutorAPI(payload);

      setSuccess("🎉 You are now a tutor!");

      // 👉 Update auth state

      setUser({
        ...res.data,
      });

      console.log(res);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
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
        {success && <p className={styles.success}>{success}</p>}

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
          <input name="experience" type="number" onChange={handleChange} />
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
    </div>
  );
};

export default BecomeTutor;
