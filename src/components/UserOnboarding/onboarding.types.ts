export interface FormState {
  fullName: string;
  bio: string;
  country: string;
  state: string;
  city: string;
  phone: string;
  preferredLanguage: string;
  dob: string;
  gender: string;
  profilePhoto: string;
}

export type FormErrors = Partial<Record<keyof FormState, string>>;

export type TouchedFields = Partial<
  Record<keyof FormState, boolean>
>;
