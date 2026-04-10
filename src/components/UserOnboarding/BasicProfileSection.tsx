import { useState } from "react";
import styles from "./UserOnboarding.module.scss";
import type { FormState } from "./onboarding.types";
import { uploadProfilePhoto } from "../../services/upload.service";

interface Props {
  form: FormState;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}

export default function BasicProfileSection({
  form,
  handleChange,
  setForm,
}: Props) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    try {
      const imageUrl = await uploadProfilePhoto(file);

      setForm((prev) => ({
        ...prev,
        profilePhoto: imageUrl,
      }));
    } catch {
      alert("Image upload failed");
    }
  };

  return (
    <section className={styles.section}>
      <h2>Basic Profile</h2>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Full Name *</label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
          />
        </div>

        <div className={styles.uploadField}>
          <label>Profile Photo</label>

          <label className={styles.uploadBox}>
            {preview ? (
              <img src={preview} alt="preview" />
            ) : (
              <span>Click to Upload</span>
            )}

            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </label>
        </div>

        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Short Bio *</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} />
        </div>

        <div className={styles.field}>
          <label>Date of Birth</label>
          <input type="date" name="dob" value={form.dob} onChange={handleChange} />
        </div>

        <div className={styles.field}>
          <label>Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Phone *</label>
          <input name="phone" value={form.phone} onChange={handleChange} />
        </div>

        <div className={styles.field}>
          <label>Country *</label>
          <input name="country" value={form.country} onChange={handleChange} />
        </div>

        <div className={styles.field}>
          <label>State *</label>
          <input name="state" value={form.state} onChange={handleChange} />
        </div>

        <div className={styles.field}>
          <label>City *</label>
          <input name="city" value={form.city} onChange={handleChange} />
        </div>

        <div className={styles.field}>
          <label>Preferred Language</label>
          <input
            name="preferredLanguage"
            value={form.preferredLanguage}
            onChange={handleChange}
          />
        </div>
      </div>
    </section>
  );
}