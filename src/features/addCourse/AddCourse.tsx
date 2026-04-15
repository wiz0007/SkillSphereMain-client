import { useState } from "react";
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
    level: state?.level || "Beginner", // ✅ FIXED
    skills: state?.skills?.join(",") || "",
    price: state?.price || "",
    duration: state?.duration || "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      price: Number(form.price),
      skills: form.skills
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
    };

    try {
      if (id) {
        await updateCourse(id, payload);
      } else {
        await createCourse(payload);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  return (
    <div className={styles.layout}>
      <div className={styles.container}>
        
        {/* FORM */}
        <div className={styles.formSection}>
          <h1>{id ? "Edit Course" : "Create Your Course"}</h1>

          <label>Course Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
          />

          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />

          <label>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="Programming">Programming</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
          </select>

          <label>Level</label>
          <select
            name="level"
            value={form.level}
            onChange={handleChange}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <label>Skills (comma separated)</label>
          <input
            name="skills"
            value={form.skills}
            onChange={handleChange}
          />

          <label>Price (₹/hour)</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
          />

          <label>Session Duration</label>
          <input
            name="duration"
            value={form.duration}
            onChange={handleChange}
          />

          <button className={styles.submit} onClick={handleSubmit}>
            {id ? "Update Course" : "Publish Course"}
          </button>
        </div>

        {/* PREVIEW */}
        <div className={styles.preview}>
          <h2>Live Preview</h2>

          <div className={styles.card}>
            <span className={styles.category}>
              {form.category || "Category"}
            </span>

            <h3>{form.title || "Course Title"}</h3>

            <p>
              {form.description || "Course description..."}
            </p>

            <div className={styles.skills}>
              {form.skills
                ?.split(",")
                .map((s: string, i: number) =>
                  s.trim() ? <span key={i}>{s.trim()}</span> : null
                )}
            </div>

            <div className={styles.meta}>
              <span>{form.level}</span>
              <span>₹{form.price || 0}/hr</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddCourse;