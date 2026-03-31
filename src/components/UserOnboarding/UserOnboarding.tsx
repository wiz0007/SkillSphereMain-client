import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./UserOnboarding.module.scss";
import { createProfile } from "../../services/profile.service";
import BasicProfileSection from "./BasicProfileSection";
import { useOnboardingForm } from "./userOnboardingForm";
import { useAuth } from "../../context/AuthContext";
import React from "react";

export default function UserOnboarding() {
  const navigate = useNavigate();
  const { form, handleChange, setForm } = useOnboardingForm();
  const { setUser } = useAuth();

  const [timezone, setTimezone] = React.useState("");

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const payload = {
      ...form,
      timezone,
    };

    try {
      const updatedUser = await createProfile(payload);
      setUser(updatedUser);
      navigate("/");
    } catch (error) {
      console.error("Profile creation failed:", error);
    }
  };

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

        <button className={styles.submitBtn}>Save Profile</button>
      </form>
    </div>
  );
}
