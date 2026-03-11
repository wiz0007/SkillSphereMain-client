import { useState } from "react";
import type { FormState } from "./onboarding.types";

export function useOnboardingForm() {
  const [form, setForm] = useState<FormState>({
    fullName: "",
    bio: "",
    country: "",
    state: "",
    city: "",
    phone: "",
    preferredLanguage: "English",
    dob: "",
    gender: "",
    profilePhoto: "",
    skills: "",
    level: "",
    goal: "",
    category: "",
    experience: "",
    hourlyRate: ""
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  return { form, setForm, handleChange };
}