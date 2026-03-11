import styles from "./UserOnboarding.module.scss";
import type { FormState } from "./onboarding.types";
interface Props {
  form: FormState;
  handleChange: any;
}

export default function TeacherSection({ form, handleChange }: Props) {
  return (
    <section className={styles.section}>
      <h2>Professional Details</h2>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Primary Skill Category</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
          />
        </div>

        <div className={styles.field}>
          <label>Years of Experience</label>
          <input
            type="number"
            name="experience"
            value={form.experience}
            onChange={handleChange}
          />
        </div>

        <div className={styles.field}>
          <label>Hourly Rate (₹)</label>
          <input
            type="number"
            name="hourlyRate"
            value={form.hourlyRate}
            onChange={handleChange}
          />
        </div>
      </div>
    </section>
  );
}