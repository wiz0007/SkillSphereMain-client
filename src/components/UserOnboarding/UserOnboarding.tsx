import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./UserOnboarding.module.scss";
import { createProfile } from "../../services/profile.service";
import BasicProfileSection from "./BasicProfileSection";
import { useOnboardingForm } from "./userOnboardingForm";
import { useAuth } from "../../context/AuthContext";

export default function UserOnboarding() {
  const navigate = useNavigate();
  const { form, handleChange, setForm } = useOnboardingForm();
  const { user, loading: authLoading, setUser } = useAuth();

  const [timezone, setTimezone] = useState("");

  /* ✅ AUTH GUARD */
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading]);

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      timezone,
    };

    try {
      await createProfile(payload);

      // ✅ SAFE AUTH UPDATE
      setUser((prev) =>
        prev
          ? {
              ...prev,
              name: payload.fullName || prev.name,
              profilePhoto: payload.profilePhoto || prev.profilePhoto,
              profileCompleted: true,
            }
          : prev
      );

      navigate("/");
    } catch (error) {
      console.error("Profile creation failed:", error);
    }
  };

  if (authLoading || !user) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <header className={styles.header}>
          <h1>Complete Your Profile</h1>
        </header>

        <BasicProfileSection
          form={form}
          handleChange={handleChange}
          setForm={setForm}
        />

        <button className={styles.submitBtn}>
          Save Profile
        </button>
      </form>
    </div>
  );
}