import { useState } from "react";
import styles from "./BecomeTutor.module.scss";
import { becomeTutor } from "../../services/profile.service";

export default function BecomeTutor() {
  const [form, setForm] = useState({
    category: "",
    experience: "",
    hourlyRate: ""
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await becomeTutor({
      category: form.category,
      experience: Number(form.experience),
      hourlyRate: Number(form.hourlyRate)
    });

    window.location.reload(); // simple refresh
  };

  return (
    <div className={styles.container}>
      <h1>Become a Tutor</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="category"
          placeholder="Skill Category"
          onChange={handleChange}
        />

        <input
          name="experience"
          type="number"
          placeholder="Years of Experience"
          onChange={handleChange}
        />

        <input
          name="hourlyRate"
          type="number"
          placeholder="Hourly Rate"
          onChange={handleChange}
        />

        <button>Become Tutor</button>
      </form>
    </div>
  );
}