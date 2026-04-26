import { z } from "zod";
import {
  getCitySuggestions,
  getStateSuggestions,
  LANGUAGE_OPTIONS,
} from "./locationOptions";
import type { FormErrors, FormState } from "./onboarding.types";

const namePattern = /^(?=.*\p{L})[\p{L}\s.'-]+$/u;
const locationPattern = /^(?=.*\p{L})[\p{L}\s.'-]+$/u;

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Enter your phone number.")
  .regex(
    /^\+?[0-9\s()-]+$/,
    "Use digits only. Spaces, brackets, dashes, and an optional leading + are allowed."
  )
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .refine(
    (value) => value.length >= 8 && value.length <= 15,
    "Phone number should be 8 to 15 digits long."
  )
  .refine(
    (value) => /^\+?[0-9]+$/.test(value),
    "Phone number must contain only digits and an optional leading +."
  );

export const onboardingSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your full name.")
      .max(50, "Full name should stay under 50 characters.")
      .regex(
        namePattern,
        "Full name should use letters and standard name punctuation only."
      ),
    bio: z
      .string()
      .trim()
      .min(10, "Write a short bio with at least 10 characters.")
      .max(300, "Short bio should stay under 300 characters."),
    country: z
      .string()
      .trim()
      .min(2, "Choose or type your country.")
      .regex(
        locationPattern,
        "Country should contain letters, spaces, apostrophes, periods, or hyphens only."
      ),
    state: z
      .string()
      .trim()
      .min(2, "Choose or type your state or province.")
      .regex(
        locationPattern,
        "State or province should contain letters, spaces, apostrophes, periods, or hyphens only."
      ),
    city: z
      .string()
      .trim()
      .min(2, "Choose or type your city.")
      .regex(
        locationPattern,
        "City should contain letters, spaces, apostrophes, periods, or hyphens only."
      ),
    phone: phoneSchema,
    preferredLanguage: z
      .string()
      .trim()
      .min(1, "Choose your preferred language."),
    dob: z
      .string()
      .optional()
      .refine(
        (value) => {
          if (!value) return true;

          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          return !Number.isNaN(selectedDate.getTime()) && selectedDate <= today;
        },
        "Date of birth cannot be in the future."
      ),
    gender: z
      .enum(["Male", "Female", "Other"])
      .or(z.literal(""))
      .optional(),
    profilePhoto: z
      .union([
        z.literal(""),
        z.string().url("Profile photo must be a valid image URL."),
      ])
      .optional(),
  })
  .superRefine((value, ctx) => {
    const states = getStateSuggestions(value.country);
    const cities = getCitySuggestions(value.country, value.state);

    if (
      states.length > 0 &&
      value.state &&
      !states.some(
        (state) =>
          state.toLowerCase() === value.state.trim().toLowerCase()
      )
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Choose a state or province from the suggestions for the selected country.",
        path: ["state"],
      });
    }

    if (
      cities.length > 0 &&
      value.city &&
      !cities.some(
        (city) =>
          city.toLowerCase() === value.city.trim().toLowerCase()
      )
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Choose a city from the suggestions for the selected state or province.",
        path: ["city"],
      });
    }

    if (
      value.preferredLanguage &&
      !LANGUAGE_OPTIONS.some(
        (language) =>
          language.toLowerCase() ===
          value.preferredLanguage.trim().toLowerCase()
      )
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Choose a preferred language from the list.",
        path: ["preferredLanguage"],
      });
    }
  });

const mapIssuesToErrors = (
  issues: Array<{
    path?: PropertyKey[];
    message?: string;
  }>
) => {
  const errors: FormErrors = {};

  issues.forEach((issue) => {
    const field = issue.path?.[0];

    if (
      typeof field === "string" &&
      typeof issue.message === "string" &&
      !errors[field as keyof FormState]
    ) {
      errors[field as keyof FormState] = issue.message;
    }
  });

  return errors;
};

export const getOnboardingErrors = (form: FormState) => {
  const parsed = onboardingSchema.safeParse(form);

  if (parsed.success) {
    return {};
  }

  return mapIssuesToErrors(parsed.error.issues);
};

export const getServerFieldErrors = (issues: unknown) => {
  if (!Array.isArray(issues)) {
    return {};
  }

  return mapIssuesToErrors(
    issues.filter(
      (
        issue
      ): issue is {
        path?: PropertyKey[];
        message?: string;
      } =>
        Array.isArray((issue as { path?: unknown }).path) &&
        typeof (issue as { message?: unknown }).message === "string"
    )
  );
};
