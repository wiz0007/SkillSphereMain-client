import { useState } from "react";
import styles from "./AddCourse.module.scss";

const AddCourse = ({ onClose, onSave }: any) => {
  const [form, setForm] = useState({
    title: "",
    skills: "",
    price: "",
    category: "",
    level: "Beginner",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.modal}>
      <div className={styles.content}>
        <h2>Add Course</h2>

        {/* TITLE */}
        <label>Course Title</label>
        <input
          name="title"
          placeholder="e.g. React Development"
          value={form.title}
          onChange={handleChange}
        />

        <input
          name="skills taught"
          placeholder="e.g. coding"
          value={form.skills}
          onChange={handleChange}
        />

        <input
          name="price"
          placeholder="in INR/hour"
          value={form.price}
          onChange={handleChange}
        />

        {/* CATEGORY */}
        <label>Category</label>
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Select a category</option>
          <option value="Programming">Programming</option>
          <option value="Design">Design</option>
          <option value="Marketing">Marketing</option>
        </select>

        {/* LEVEL */}
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

        <div className={styles.actions}>
          <button className={styles.save} onClick={() => onSave(form)}>
            Save
          </button>
          <button className={styles.cancel} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;