import styles from "./UserOnboarding.module.scss";
import type { FormState } from "./onboarding.types";

interface Props {
  form: FormState;
  handleChange: any;
}

export default function StudentSection({ form, handleChange }: Props) {
  return (
    <section className={styles.section}>
      <h2>Learning Preferences</h2>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Skills Interested In</label>
          <input
            name="skills"
            placeholder="React, Python"
            value={form.skills}
            onChange={handleChange}
          />
        </div>

        <div className={styles.field}>
          <label>Learning Level</label>
          <select name="level" value={form.level} onChange={handleChange}>
            <option value="">Select</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Learning Goal</label>
          <select name="goal" value={form.goal} onChange={handleChange}>
            <option value="">Select</option>
            <option>Career Switch</option>
            <option>Academic Help</option>
            <option>Hobby</option>
            <option>Certification Prep</option>
          </select>
        </div>
      </div>
    </section>
  );
}