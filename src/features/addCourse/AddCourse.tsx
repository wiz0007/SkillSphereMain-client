import { useState } from "react";
import {
  Clock3,
  IndianRupee,
  Layers3,
  Save,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import styles from "./AddCourse.module.scss";

import {
  createCourse,
  updateCourse,
} from "../../services/courses.service";

const AddCourse = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();

  const [form, setForm] = useState({
    title: state?.title || "",
    description: state?.description || "",
    category: state?.category || "",
    level: state?.level || "Beginner",
    skills: state?.skills?.join(", ") || "",
    price: state?.price || "",
    duration: state?.duration || "",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      price: Number(form.price),
      skills: form.skills
        .split(",")
        .map((item: string) => item.trim())
        .filter(Boolean),
    };

    try {
      setSaving(true);

      if (id) {
        await updateCourse(id, payload);
      } else {
        await createCourse(payload);
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const previewSkills = form.skills
    .split(",")
    .map((item: string) => item.trim())
    .filter(Boolean)
    .slice(0, 4);

  return (
    <section className={styles.layout}>
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>
            {id ? "Edit Course" : "New Course"}
          </span>
          <h1>
            {id
              ? "Refresh the details and keep your course current."
              : "Create a course that feels ready to publish."}
          </h1>
          <p>
            Use the same dashboard language across title, price,
            duration, and scope so students know exactly what they
            are booking.
          </p>
        </div>

        <div className={styles.snapshot}>
          <span className={styles.snapshotLabel}>Preview state</span>
          <strong>{form.title || "Untitled course"}</strong>
          <span className={styles.snapshotHint}>
            {form.category || "Category pending"} |{" "}
            {form.level || "Level pending"}
          </span>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h2>Course details</h2>
            <p>
              Fill out the core information students need before
              requesting a session.
            </p>
          </div>

          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>Course title</span>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="For example: React interview prep"
              />
            </label>

            <label className={styles.field}>
              <span>Category</span>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                <option value="Programming">Programming</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sports">Sports</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Level</span>
              <select
                name="level"
                value={form.level}
                onChange={handleChange}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Session duration</span>
              <input
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="60 min"
              />
            </label>

            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span>Description</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe outcomes, approach, and who this course is for."
              />
            </label>

            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span>Skills</span>
              <input
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="React, JavaScript, Interview prep"
              />
            </label>

            <label className={styles.field}>
              <span>Price per hour</span>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="1200"
              />
            </label>
          </div>

          <button
            type="button"
            className={styles.submit}
            onClick={handleSubmit}
            disabled={saving}
          >
            <Save size={16} />
            {saving
              ? "Saving..."
              : id
                ? "Update course"
                : "Publish course"}
          </button>
        </div>

        <aside className={styles.preview}>
          <div className={styles.sectionHeader}>
            <h2>Live preview</h2>
            <p>
              This mirrors the dashboard-style course cards students
              will see.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.previewTop}>
              <span className={styles.category}>
                {form.category || "Category"}
              </span>
              <span className={styles.levelPill}>
                {form.level || "Level"}
              </span>
            </div>

            <h3>{form.title || "Course title"}</h3>
            <p>
              {form.description ||
                "Course description will appear here as you type."}
            </p>

            <div className={styles.skills}>
              {previewSkills.length
                ? previewSkills.map(
                    (skill: string, index: number) => (
                    <span key={`${skill}-${index}`}>{skill}</span>
                    )
                  )
                : null}
            </div>

            <div className={styles.metrics}>
              <div className={styles.metric}>
                <IndianRupee size={15} />
                <span>{form.price || 0}/hr</span>
              </div>
              <div className={styles.metric}>
                <Clock3 size={15} />
                <span>{form.duration || "Flexible"}</span>
              </div>
              <div className={styles.metric}>
                <Layers3 size={15} />
                <span>{form.level || "All levels"}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default AddCourse;
