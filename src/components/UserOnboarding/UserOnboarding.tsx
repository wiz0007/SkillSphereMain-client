import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./UserOnboarding.module.scss";
import { createProfile } from "../../services/profile.service";
import RoleSwitch from "./RoleSwitch";
import BasicProfileSection from "./BasicProfileSection";
import StudentSection from "./StudentSection";
import TeacherSection from "./TeacherSection";
import { useOnboardingForm } from "./userOnboardingForm";
import type { Role } from "./onboarding.types";
import { useAuth } from "../../context/AuthContext"; // ✅ ADD

export default function UserOnboarding() {
  const navigate = useNavigate();
  const { form, handleChange, setForm } = useOnboardingForm();
  const { setUser } = useAuth(); // ✅ ADD

  const [role, setRole] = useState<Role>("student");
  const [timezone, setTimezone] = useState("");

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const payload: any = {
      role,
      ...form,
      timezone,
    };

    if (role === "student") {
      payload.studentDetails = {
        skills: form.skills.split(",").map((s) => s.trim()),
        level: form.level,
        goal: form.goal,
      };
    }

    if (role === "teacher") {
      payload.teacherDetails = {
        category: form.category,
        experience: Number(form.experience),
        hourlyRate: Number(form.hourlyRate),
      };
    }

    try {
      const updatedUser = await createProfile(payload);

      console.log("UPDATED USER:", updatedUser);

      // 🔥 THIS FIXES NAVBAR AVATAR
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
          <RoleSwitch role={role} setRole={setRole} />
        </header>

        <BasicProfileSection form={form} handleChange={handleChange} setForm={setForm} />

        {role === "student" && (
          <StudentSection form={form} handleChange={handleChange} />
        )}

        {role === "teacher" && (
          <TeacherSection form={form} handleChange={handleChange} />
        )}

        <button className={styles.submitBtn}>Save Profile</button>
      </form>
    </div>
  );
}