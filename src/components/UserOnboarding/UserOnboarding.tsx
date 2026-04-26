import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./UserOnboarding.module.scss";
import { createProfile } from "../../services/profile.service";
import BasicProfileSection from "./BasicProfileSection";
import { useOnboardingForm } from "./userOnboardingForm";
import { useAuth } from "../../context/AuthContext";
import {
  getOnboardingErrors,
  getServerFieldErrors,
  onboardingSchema,
} from "./onboarding.validation";
import type {
  FormErrors,
  FormState,
  TouchedFields,
} from "./onboarding.types";

function UserOnboarding() {
  const navigate = useNavigate();
  const { form, updateField } = useOnboardingForm();
  const { user, loading: authLoading, setUser } = useAuth();

  const [timezone, setTimezone] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [formError, setFormError] = useState("");
  const [serverFieldErrors, setServerFieldErrors] =
    useState<FormErrors>({});
  const [touchedFields, setTouchedFields] =
    useState<TouchedFields>({});

  const validationErrors = useMemo(
    () => getOnboardingErrors(form),
    [form]
  );

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const markFieldTouched = (field: keyof FormState) => {
    setTouchedFields((previous) =>
      previous[field]
        ? previous
        : {
            ...previous,
            [field]: true,
          }
    );
  };

  const handleFieldChange = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    updateField(field, value);
    setFormError("");

    setServerFieldErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }

      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const handleFieldBlur = (field: keyof FormState) => {
    markFieldTouched(field);
  };

  const getVisibleError = (field: keyof FormState) => {
    if (serverFieldErrors[field]) {
      return serverFieldErrors[field];
    }

    return touchedFields[field] || submitAttempted
      ? validationErrors[field]
      : undefined;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setSubmitAttempted(true);
    setFormError("");
    setServerFieldErrors({});

    const parsed = onboardingSchema.safeParse(form);

    if (!parsed.success) {
      return;
    }

    const payload = {
      ...parsed.data,
      dob: parsed.data.dob || undefined,
      gender: parsed.data.gender || undefined,
      profilePhoto: parsed.data.profilePhoto || undefined,
      timezone,
    };

    try {
      setSaving(true);
      const createdProfile = await createProfile(payload);

      setUser((previous: any) =>
        previous
          ? {
              ...previous,
              name:
                createdProfile.fullName ||
                payload.fullName ||
                previous.name,
              profilePhoto:
                createdProfile.profilePhoto ||
                payload.profilePhoto ||
                previous.profilePhoto,
              profileCompleted: true,
            }
          : previous
      );

      navigate("/");
    } catch (error: any) {
      console.error("Profile creation failed:", error);

      const apiMessage =
        error?.response?.data?.message ||
        "We could not save your profile right now.";

      const fieldErrors = getServerFieldErrors(
        error?.response?.data?.errors
      );

      if (Object.keys(fieldErrors).length > 0) {
        setServerFieldErrors(fieldErrors);
      }

      setFormError(apiMessage);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <header className={styles.header}>
          <p className={styles.kicker}>Profile Setup</p>
          <h1>Complete your profile before you start exploring.</h1>
          <p className={styles.subtitle}>
            These details help the dashboard, public profile,
            and session flows stay aligned from the beginning.
          </p>
        </header>

        {formError ? (
          <div className={styles.errorBanner}>{formError}</div>
        ) : null}

        <BasicProfileSection
          form={form}
          onFieldChange={handleFieldChange}
          onFieldBlur={handleFieldBlur}
          getFieldError={getVisibleError}
        />

        <button
          className={styles.submitBtn}
          disabled={saving}
          type="submit"
        >
          {saving ? "Saving profile..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}

export default UserOnboarding;
