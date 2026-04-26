import { useEffect, useMemo, useState } from "react";
import styles from "./UserOnboarding.module.scss";
import type { FormState } from "./onboarding.types";
import { uploadProfilePhoto } from "../../services/upload.service";
import {
  COUNTRY_OPTIONS,
  getCitySuggestions,
  getStateSuggestions,
  LANGUAGE_OPTIONS,
} from "./locationOptions";

interface Props {
  form: FormState;
  onFieldChange: <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => void;
  onFieldBlur: (field: keyof FormState) => void;
  getFieldError: (field: keyof FormState) => string | undefined;
}

function BasicProfileSection({
  form,
  onFieldChange,
  onFieldBlur,
  getFieldError,
}: Props) {
  const [preview, setPreview] = useState(form.profilePhoto || "");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const stateSuggestions = useMemo(
    () => getStateSuggestions(form.country),
    [form.country]
  );

  const citySuggestions = useMemo(
    () => getCitySuggestions(form.country, form.state),
    [form.country, form.state]
  );

  useEffect(() => {
    if (!form.profilePhoto || preview.startsWith("blob:")) {
      return;
    }

    setPreview(form.profilePhoto);
  }, [form.profilePhoto, preview]);

  useEffect(() => {
    if (!preview.startsWith("blob:")) {
      return undefined;
    }

    return () => {
      URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError("");
    const nextPreview = URL.createObjectURL(file);
    setPreview(nextPreview);

    try {
      setUploadingPhoto(true);
      const imageUrl = await uploadProfilePhoto(file);
      onFieldChange("profilePhoto", imageUrl);
      setPreview(imageUrl);
    } catch (error) {
      console.error("Image upload failed:", error);
      setUploadError("We could not upload that image. Try another file.");
    } finally {
      setUploadingPhoto(false);
      event.target.value = "";
    }
  };

  const handleCountryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onFieldChange("country", event.target.value);
    onFieldChange("state", "");
    onFieldChange("city", "");
  };

  const handleStateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onFieldChange("state", event.target.value);
    onFieldChange("city", "");
  };

  const countryError = getFieldError("country");
  const stateError = getFieldError("state");
  const cityError = getFieldError("city");

  return (
    <section className={styles.section}>
      <div className={styles.panelGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.eyebrow}>Identity</span>
            <h2>Basic profile</h2>
            <p>
              Add the essentials learners and collaborators will
              recognize first.
            </p>
          </div>

          <div className={styles.identityGrid}>
            <div className={styles.uploadField}>
              <label htmlFor="profile-photo-upload">
                Profile Photo
              </label>

              <label className={styles.uploadBox}>
                {preview ? (
                  <img src={preview} alt="Profile preview" />
                ) : (
                  <span>Click to upload</span>
                )}

                <input
                  id="profile-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>

              <p className={styles.fieldHint}>
                {uploadingPhoto
                  ? "Uploading your image..."
                  : "Use a clear headshot or profile image."}
              </p>
              {uploadError ? (
                <span className={styles.fieldError}>
                  {uploadError}
                </span>
              ) : null}
            </div>

            <div className={`${styles.field} ${styles.fieldWide}`}>
              <label htmlFor="full-name">Full Name *</label>
              <input
                id="full-name"
                name="fullName"
                autoComplete="name"
                maxLength={50}
                placeholder="Your full name"
                value={form.fullName}
                onBlur={() => onFieldBlur("fullName")}
                onChange={(event) =>
                  onFieldChange("fullName", event.target.value)
                }
                aria-invalid={Boolean(getFieldError("fullName"))}
                className={
                  getFieldError("fullName")
                    ? styles.inputError
                    : undefined
                }
              />
              {getFieldError("fullName") ? (
                <span className={styles.fieldError}>
                  {getFieldError("fullName")}
                </span>
              ) : null}
            </div>

            <div className={`${styles.field} ${styles.fieldWide}`}>
              <label htmlFor="short-bio">Short Bio *</label>
              <textarea
                id="short-bio"
                name="bio"
                maxLength={300}
                placeholder="Tell people a little about yourself."
                value={form.bio}
                onBlur={() => onFieldBlur("bio")}
                onChange={(event) =>
                  onFieldChange("bio", event.target.value)
                }
                aria-invalid={Boolean(getFieldError("bio"))}
                className={
                  getFieldError("bio")
                    ? styles.inputError
                    : undefined
                }
              />
              <div className={styles.fieldMetaRow}>
                <span className={styles.fieldHint}>
                  Keep it short and useful.
                </span>
                <span className={styles.counter}>
                  {form.bio.length}/300
                </span>
              </div>
              {getFieldError("bio") ? (
                <span className={styles.fieldError}>
                  {getFieldError("bio")}
                </span>
              ) : null}
            </div>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.eyebrow}>Details</span>
            <h2>Location and contact</h2>
            <p>
              Structured details keep booking, profile, and
              messaging flows consistent.
            </p>
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="dob">Date of Birth</label>
              <input
                id="dob"
                type="date"
                name="dob"
                value={form.dob}
                onBlur={() => onFieldBlur("dob")}
                onChange={(event) =>
                  onFieldChange("dob", event.target.value)
                }
                aria-invalid={Boolean(getFieldError("dob"))}
                className={
                  getFieldError("dob")
                    ? styles.inputError
                    : undefined
                }
              />
              {getFieldError("dob") ? (
                <span className={styles.fieldError}>
                  {getFieldError("dob")}
                </span>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onBlur={() => onFieldBlur("gender")}
                onChange={(event) =>
                  onFieldChange("gender", event.target.value)
                }
                aria-invalid={Boolean(getFieldError("gender"))}
                className={
                  getFieldError("gender")
                    ? styles.inputError
                    : undefined
                }
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {getFieldError("gender") ? (
                <span className={styles.fieldError}>
                  {getFieldError("gender")}
                </span>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="phone">Phone *</label>
              <input
                id="phone"
                name="phone"
                autoComplete="tel"
                inputMode="tel"
                placeholder="+91 9876543210"
                value={form.phone}
                onBlur={() => onFieldBlur("phone")}
                onChange={(event) =>
                  onFieldChange("phone", event.target.value)
                }
                aria-invalid={Boolean(getFieldError("phone"))}
                className={
                  getFieldError("phone")
                    ? styles.inputError
                    : undefined
                }
              />
              <p className={styles.fieldHint}>
                Spaces are okay. We normalize them before saving.
              </p>
              {getFieldError("phone") ? (
                <span className={styles.fieldError}>
                  {getFieldError("phone")}
                </span>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="country">Country *</label>
              <input
                id="country"
                name="country"
                list="country-options"
                autoComplete="country-name"
                placeholder="Select or type your country"
                value={form.country}
                onBlur={() => onFieldBlur("country")}
                onChange={handleCountryChange}
                aria-invalid={Boolean(countryError)}
                className={
                  countryError ? styles.inputError : undefined
                }
              />
              <datalist id="country-options">
                {COUNTRY_OPTIONS.map((country) => (
                  <option key={country} value={country} />
                ))}
              </datalist>
              <p className={styles.fieldHint}>
                Pick from the suggestions for faster state and city help.
              </p>
              {countryError ? (
                <span className={styles.fieldError}>
                  {countryError}
                </span>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="state">State / Province *</label>
              <input
                id="state"
                name="state"
                list="state-options"
                autoComplete="address-level1"
                placeholder="Select or type your state"
                value={form.state}
                onBlur={() => onFieldBlur("state")}
                onChange={handleStateChange}
                aria-invalid={Boolean(stateError)}
                className={
                  stateError ? styles.inputError : undefined
                }
              />
              <datalist id="state-options">
                {stateSuggestions.map((state) => (
                  <option key={state} value={state} />
                ))}
              </datalist>
              <p className={styles.fieldHint}>
                {stateSuggestions.length > 0
                  ? "Suggestions are based on the selected country."
                  : "Type your state if suggestions are unavailable for your country."}
              </p>
              {stateError ? (
                <span className={styles.fieldError}>
                  {stateError}
                </span>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="city">City *</label>
              <input
                id="city"
                name="city"
                list="city-options"
                autoComplete="address-level2"
                placeholder="Select or type your city"
                value={form.city}
                onBlur={() => onFieldBlur("city")}
                onChange={(event) =>
                  onFieldChange("city", event.target.value)
                }
                aria-invalid={Boolean(cityError)}
                className={
                  cityError ? styles.inputError : undefined
                }
              />
              <datalist id="city-options">
                {citySuggestions.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
              <p className={styles.fieldHint}>
                {citySuggestions.length > 0
                  ? "City suggestions narrow down after you choose a state."
                  : "Type your city if suggestions are unavailable for your region."}
              </p>
              {cityError ? (
                <span className={styles.fieldError}>
                  {cityError}
                </span>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="preferred-language">
                Preferred Language *
              </label>
              <input
                id="preferred-language"
                name="preferredLanguage"
                list="language-options"
                placeholder="Select your preferred language"
                value={form.preferredLanguage}
                onBlur={() => onFieldBlur("preferredLanguage")}
                onChange={(event) =>
                  onFieldChange(
                    "preferredLanguage",
                    event.target.value
                  )
                }
                aria-invalid={Boolean(
                  getFieldError("preferredLanguage")
                )}
                className={
                  getFieldError("preferredLanguage")
                    ? styles.inputError
                    : undefined
                }
              />
              <datalist id="language-options">
                {LANGUAGE_OPTIONS.map((language) => (
                  <option key={language} value={language} />
                ))}
              </datalist>
              {getFieldError("preferredLanguage") ? (
                <span className={styles.fieldError}>
                  {getFieldError("preferredLanguage")}
                </span>
              ) : null}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default BasicProfileSection;
