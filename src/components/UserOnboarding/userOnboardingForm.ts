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
  });

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    updateField(name as keyof FormState, value);
  };

  return { form, setForm, handleChange, updateField };
}
