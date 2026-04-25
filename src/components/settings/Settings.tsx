import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import styles from "./Settings.module.scss";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  changePassword,
  checkUsername,
  deleteAccount,
} from "../../services/auth.service";
import {
  getMyProfile,
  updateProfile,
  type ProfileSettings,
} from "../../services/profile.service";

interface SettingsProfile {
  fullName: string;
  email: string;
  username: string;
  city: string;
  country: string;
  bio: string;
  settings: ProfileSettings;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const defaultSettings: ProfileSettings = {
  theme: "dark",
  notifications: {
    sessionUpdates: true,
    courseRecommendations: true,
    marketingEmails: false,
  },
};

const normalizeSettings = (settings?: ProfileSettings): ProfileSettings => ({
  theme: settings?.theme || "dark",
  notifications: {
    sessionUpdates: settings?.notifications?.sessionUpdates ?? true,
    courseRecommendations:
      settings?.notifications?.courseRecommendations ?? true,
    marketingEmails: settings?.notifications?.marketingEmails ?? false,
  },
});

const Settings = () => {
  const { user, logout, setUser } = useAuth();
  const { dark, toggleTheme } = useTheme();

  const [profile, setProfile] = useState<SettingsProfile | null>(null);
  const [form, setForm] = useState<SettingsProfile>({
    fullName: "",
    email: "",
    username: "",
    city: "",
    country: "",
    bio: "",
    settings: defaultSettings,
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteStepOne, setDeleteStepOne] = useState(false);
  const [deleteStepTwo, setDeleteStepTwo] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        const nextProfile: SettingsProfile = {
          fullName: data.fullName || "",
          email: data.email || "",
          username: data.username || "",
          city: data.city || "",
          country: data.country || "",
          bio: data.bio || "",
          settings: normalizeSettings(data.settings),
        };

        setProfile(nextProfile);
        setForm(nextProfile);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (!profile) return;

    const trimmedUsername = form.username.trim().toLowerCase();
    const currentUsername = profile.username.trim().toLowerCase();

    if (!trimmedUsername || trimmedUsername === currentUsername) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");

    const timer = setTimeout(async () => {
      try {
        const res = await checkUsername(trimmedUsername);
        setUsernameStatus(res.available ? "available" : "taken");
      } catch {
        setUsernameStatus("idle");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [form.username, profile]);

  useEffect(() => {
    if (!profile) return;

    const desiredTheme = form.settings.theme || "dark";
    const isDarkDesired = desiredTheme === "dark";

    if (dark !== isDarkDesired) {
      toggleTheme();
    }
  }, [dark, form.settings.theme, profile, toggleTheme]);

  const passwordChecks = useMemo(
    () => ({
      length: passwordForm.newPassword.length >= 8,
      upper: /[A-Z]/.test(passwordForm.newPassword),
      lower: /[a-z]/.test(passwordForm.newPassword),
      number: /\d/.test(passwordForm.newPassword),
      special: /[@$!%*?&]/.test(passwordForm.newPassword),
    }),
    [passwordForm.newPassword]
  );

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const updateField = (field: keyof SettingsProfile, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNotification = (
    key: keyof NonNullable<ProfileSettings["notifications"]>
  ) => {
    setForm((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        notifications: {
          ...normalizeSettings(prev.settings).notifications,
          [key]: !normalizeSettings(prev.settings).notifications?.[key],
        },
      },
    }));
    setMessage("");
  };

  const handleThemeToggle = () => {
    setForm((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        theme: prev.settings.theme === "dark" ? "light" : "dark",
      },
    }));
    setMessage("");
  };

  const handleSave = async () => {
    if (!profile) return;

    const normalizedUsername = form.username.trim().toLowerCase();
    const currentUsername = profile.username.trim().toLowerCase();

    if (
      normalizedUsername !== currentUsername &&
      usernameStatus !== "available"
    ) {
      setMessage("Pick an available username before saving.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const updated = await updateProfile({
        username: normalizedUsername,
        fullName: form.fullName,
        city: form.city,
        country: form.country,
        bio: form.bio,
        settings: normalizeSettings(form.settings),
      });

      const nextProfile: SettingsProfile = {
        fullName: updated.fullName || "",
        email: updated.email || profile.email || user?.email || "",
        username: updated.username || normalizedUsername,
        city: updated.city || "",
        country: updated.country || "",
        bio: updated.bio || "",
        settings: normalizeSettings(updated.settings),
      };

      setProfile(nextProfile);
      setForm(nextProfile);
      setUser((prev) =>
        prev
          ? {
              ...prev,
              username: nextProfile.username,
              email: nextProfile.email,
            }
          : prev
      );
      setUsernameStatus("idle");
      setMessage("Settings saved successfully.");
    } catch (error: any) {
      console.error(error);
      setMessage(
        error?.response?.data?.message || "Could not save your changes."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordMessage("");

    if (!passwordForm.currentPassword) {
      setPasswordMessage("Current password is required.");
      return;
    }

    if (!isPasswordValid) {
      setPasswordMessage("New password does not meet requirements.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("New password and confirmation do not match.");
      return;
    }

    setPasswordSaving(true);

    try {
      const res = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordMessage(res.message || "Password updated successfully.");
    } catch (error: any) {
      console.error(error);
      setPasswordMessage(
        error?.response?.data?.message || "Could not update password."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteMessage("");

    if (!deleteStepOne || !deleteStepTwo) {
      setDeleteMessage("Please complete all confirmations first.");
      return;
    }

    if (deleteConfirmText !== "DELETE MY ACCOUNT") {
      setDeleteMessage("Type the exact confirmation phrase.");
      return;
    }

    if (!deletePassword) {
      setDeleteMessage("Enter your current password to continue.");
      return;
    }

    setDeleteLoading(true);

    try {
      await deleteAccount({
        currentPassword: deletePassword,
        confirmationText: deleteConfirmText,
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/register";
    } catch (error: any) {
      console.error(error);
      setDeleteMessage(
        error?.response?.data?.message || "Could not delete account."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading settings...</div>;
  }

  return (
    <motion.section
      className={styles.container}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Workspace Settings</p>
          <h1>Control your account and learning experience</h1>
          <p className={styles.subtitle}>
            Update your public details, manage personal preferences,
            and secure your account from one place.
          </p>
        </div>

        <div className={styles.heroCard}>
          <span className={styles.heroLabel}>Signed in as</span>
          <strong>{profile?.username || user?.username}</strong>
          <span>{profile?.email || user?.email}</span>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Profile Preferences</h2>
              <p>Keep your public-facing details current and consistent.</p>
            </div>
          </div>

          <div className={styles.formGrid}>
            <label>
              Full Name
              <input
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                placeholder="Your full name"
              />
            </label>

            <label>
              Username
              <input
                value={form.username}
                onChange={(e) => updateField("username", e.target.value)}
                placeholder="Choose a username"
              />
              <span className={styles.inlineHint}>
                {usernameStatus === "checking" && "Checking username..."}
                {usernameStatus === "available" && "Username is available"}
                {usernameStatus === "taken" && "That username is already taken"}
                {usernameStatus === "idle" &&
                  "Letters, numbers, and underscores only"}
              </span>
            </label>

            <label>
              Email
              <input value={form.email} disabled placeholder="Email address" />
              <span className={styles.inlineHint}>
                Email cannot be changed from settings.
              </span>
            </label>

            <label>
              City
              <input
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="Your city"
              />
            </label>

            <label>
              Country
              <input
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
                placeholder="Your country"
              />
            </label>
          </div>

          <label className={styles.textareaField}>
            Bio
            <textarea
              value={form.bio}
              onChange={(e) => updateField("bio", e.target.value)}
              placeholder="Tell people what you're learning or teaching."
            />
          </label>
        </div>

        <div className={styles.stack}>
          <div className={styles.card}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Appearance</h2>
                <p>Your theme preference is now saved with your account.</p>
              </div>
            </div>

            <button
              type="button"
              className={styles.preferenceRow}
              onClick={handleThemeToggle}
            >
              <div>
                <strong>Theme Mode</strong>
                <span>
                  {form.settings.theme === "dark"
                    ? "Dark mode is selected"
                    : "Light mode is selected"}
                </span>
              </div>
              <span className={styles.pill}>
                {form.settings.theme === "dark" ? "Dark" : "Light"}
              </span>
            </button>
          </div>

          <div className={styles.card}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Notifications</h2>
                <p>These preferences are stored on your account now.</p>
              </div>
            </div>

            <button
              type="button"
              className={styles.preferenceRow}
              onClick={() => updateNotification("sessionUpdates")}
            >
              <div>
                <strong>Session Updates</strong>
                <span>Reminders, status changes, and booking activity.</span>
              </div>
              <span
                className={`${styles.toggle} ${
                  form.settings.notifications?.sessionUpdates
                    ? styles.toggleOn
                    : ""
                }`}
              >
                {form.settings.notifications?.sessionUpdates ? "On" : "Off"}
              </span>
            </button>

            <button
              type="button"
              className={styles.preferenceRow}
              onClick={() => updateNotification("courseRecommendations")}
            >
              <div>
                <strong>Course Recommendations</strong>
                <span>Suggestions based on your profile and activity.</span>
              </div>
              <span
                className={`${styles.toggle} ${
                  form.settings.notifications?.courseRecommendations
                    ? styles.toggleOn
                    : ""
                }`}
              >
                {form.settings.notifications?.courseRecommendations
                  ? "On"
                  : "Off"}
              </span>
            </button>

            <button
              type="button"
              className={styles.preferenceRow}
              onClick={() => updateNotification("marketingEmails")}
            >
              <div>
                <strong>Product Updates</strong>
                <span>Occasional launch notes and feature announcements.</span>
              </div>
              <span
                className={`${styles.toggle} ${
                  form.settings.notifications?.marketingEmails
                    ? styles.toggleOn
                    : ""
                }`}
              >
                {form.settings.notifications?.marketingEmails ? "On" : "Off"}
              </span>
            </button>
          </div>

          <div className={styles.card}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Account Actions</h2>
                <p>Save your changes or end your current session.</p>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={logout}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.securityGrid}>
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Change Password</h2>
              <p>Use a strong password you are not using anywhere else.</p>
            </div>
          </div>

          <div className={styles.formGrid}>
            <label>
              Current Password
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                placeholder="Current password"
              />
            </label>

            <label>
              New Password
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                placeholder="New password"
              />
            </label>

            <label>
              Confirm Password
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="Confirm new password"
              />
            </label>
          </div>

          <div className={styles.passwordRules}>
            <span className={passwordChecks.length ? styles.ruleValid : ""}>
              8+ characters
            </span>
            <span className={passwordChecks.upper ? styles.ruleValid : ""}>
              uppercase
            </span>
            <span className={passwordChecks.lower ? styles.ruleValid : ""}>
              lowercase
            </span>
            <span className={passwordChecks.number ? styles.ruleValid : ""}>
              number
            </span>
            <span className={passwordChecks.special ? styles.ruleValid : ""}>
              special char
            </span>
          </div>

          <div className={styles.inlineActions}>
            <span className={styles.feedback}>
              {passwordMessage || "Password changes take effect immediately."}
            </span>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={handlePasswordChange}
              disabled={passwordSaving}
            >
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>

        <div className={`${styles.card} ${styles.dangerCard}`}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Delete Account</h2>
              <p>
                This removes your account, profile, sessions, notifications,
                and your courses. This cannot be undone.
              </p>
            </div>
          </div>

          <label className={styles.confirmRow}>
            <input
              type="checkbox"
              checked={deleteStepOne}
              onChange={(e) => setDeleteStepOne(e.target.checked)}
            />
            <span>I understand this action is permanent.</span>
          </label>

          <label className={styles.confirmRow}>
            <input
              type="checkbox"
              checked={deleteStepTwo}
              onChange={(e) => setDeleteStepTwo(e.target.checked)}
            />
            <span>I understand my sessions and created courses will be removed.</span>
          </label>

          <label className={styles.textareaField}>
            Type DELETE MY ACCOUNT
            <input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
            />
          </label>

          <label className={styles.textareaField}>
            Current Password
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Current password"
            />
          </label>

          <div className={styles.inlineActions}>
            <span className={styles.feedback}>
              {deleteMessage || "Complete every confirmation before deleting."}
            </span>

            <button
              type="button"
              className={styles.dangerButton}
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.footerBar}>
        <div className={styles.feedback}>
          {message || "Settings are saved to your account when you click save."}
        </div>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </motion.section>
  );
};

export default Settings;
