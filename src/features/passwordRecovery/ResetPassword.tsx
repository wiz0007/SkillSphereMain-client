import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { AlertTriangle } from "lucide-react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../../services/auth.service";
import styles from "./PasswordRecovery.module.scss";

export function ResetPassword() {
  const navigate = useNavigate();
  const { token = "" } = useParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touched, setTouched] = useState({
    newPassword: false,
    confirmPassword: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const newPasswordRef = useRef<HTMLInputElement | null>(null);
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null);

  const validationErrors = useMemo(
    () => ({
      token: !token ? "This reset link is missing or invalid." : "",
      newPassword: !newPassword
        ? "Enter a new password."
        : !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(
              newPassword
            )
          ? "Use at least 8 characters with upper, lower, number, and special character."
          : "",
      confirmPassword: !confirmPassword
        ? "Confirm your new password."
        : confirmPassword !== newPassword
          ? "Passwords do not match."
          : "",
    }),
    [confirmPassword, newPassword, token]
  );

  const visibleErrors = {
    newPassword:
      touched.newPassword || submitAttempted
        ? validationErrors.newPassword
        : "",
    confirmPassword:
      touched.confirmPassword || submitAttempted
        ? validationErrors.confirmPassword
        : "",
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    setTouched({ newPassword: true, confirmPassword: true });
    setError("");
    setSuccess("");

    if (validationErrors.token) {
      setError(validationErrors.token);
      return;
    }

    if (validationErrors.newPassword) {
      newPasswordRef.current?.focus();
      return;
    }

    if (validationErrors.confirmPassword) {
      confirmPasswordRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      const response = await resetPassword({
        token,
        newPassword,
      });
      setSuccess(response.message);
      setTimeout(() => {
        navigate("/login");
      }, 1600);
    } catch (nextError: any) {
      setError(
        nextError?.response?.data?.message ||
          "Could not reset password right now."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.hero}>
          <p className={styles.kicker}>Choose a New Password</p>
          <h1>Secure your account and get back to learning fast.</h1>
          <p className={styles.subtitle}>
            Set a fresh password for your SkillSphere account. Once it’s updated,
            you’ll be able to sign back in immediately.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Reset password</h2>
            <p>
              Pick a strong password you haven’t used on this account before.
            </p>
          </div>

          {error ? <div className={styles.errorBanner}>{error}</div> : null}
          {success ? <div className={styles.successBanner}>{success}</div> : null}

          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.field}>
              <span>New password</span>
              <div className={styles.passwordField}>
                <input
                  ref={newPasswordRef}
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  placeholder="Enter a strong new password"
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setNewPassword(event.target.value)
                  }
                  onBlur={() =>
                    setTouched((previous) => ({
                      ...previous,
                      newPassword: true,
                    }))
                  }
                  className={
                    visibleErrors.newPassword ? styles.inputError : undefined
                  }
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword((previous) => !previous)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {visibleErrors.newPassword ? (
                <small className={styles.errorText}>
                  {visibleErrors.newPassword}
                </small>
              ) : (
                <small className={styles.helperText}>
                  Use upper and lowercase letters, a number, and a special
                  character.
                </small>
              )}
            </label>

            <label className={styles.field}>
              <span>Confirm password</span>
              <div className={styles.passwordField}>
                <input
                  ref={confirmPasswordRef}
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  placeholder="Re-enter your new password"
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setConfirmPassword(event.target.value)
                  }
                  onBlur={() =>
                    setTouched((previous) => ({
                      ...previous,
                      confirmPassword: true,
                    }))
                  }
                  className={
                    visibleErrors.confirmPassword
                      ? styles.inputError
                      : undefined
                  }
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {visibleErrors.confirmPassword ? (
                <small className={styles.errorText}>
                  {visibleErrors.confirmPassword}
                </small>
              ) : (
                <small className={styles.helperText}>
                  Make sure both password entries match exactly.
                </small>
              )}
            </label>

            {submitAttempted &&
            (validationErrors.token ||
              validationErrors.newPassword ||
              validationErrors.confirmPassword) ? (
              <div className={styles.summaryBanner} role="alert">
                <AlertTriangle size={16} />
                <span>Fix the highlighted reset fields before continuing.</span>
              </div>
            ) : null}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Resetting password..." : "Reset password"}
            </button>
          </form>

          <div className={styles.footer}>
            <span>
              Need a fresh link? <Link to="/forgot-password">Request another one</Link>
            </span>
            <Link to="/login">Back to sign in</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
