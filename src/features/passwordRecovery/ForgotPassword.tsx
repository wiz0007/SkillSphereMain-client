import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../services/auth.service";
import styles from "./PasswordRecovery.module.scss";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const emailRef = useRef<HTMLInputElement | null>(null);

  const emailError = useMemo(() => {
    if (!email.trim()) {
      return "Enter your email address.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Enter a valid email address.";
    }

    return "";
  }, [email]);

  const visibleEmailError = touched || submitAttempted ? emailError : "";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    setTouched(true);
    setError("");
    setSuccess("");

    if (emailError) {
      emailRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      const response = await forgotPassword({ email: email.trim() });
      setSuccess(response.message);
    } catch (nextError: any) {
      setError(
        nextError?.response?.data?.message ||
          "Could not start password reset right now."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.hero}>
          <p className={styles.kicker}>Password Recovery</p>
          <h1>Get back into SkillSphere without starting over.</h1>
          <p className={styles.subtitle}>
            Enter the email linked to your account and we’ll send a secure
            reset link so you can choose a new password.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Forgot password</h2>
            <p>
              We’ll email a reset link that stays active for 30 minutes.
            </p>
          </div>

          {error ? <div className={styles.errorBanner}>{error}</div> : null}
          {success ? <div className={styles.successBanner}>{success}</div> : null}

          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.field}>
              <span>Email address</span>
              <input
                ref={emailRef}
                type="email"
                value={email}
                placeholder="you@example.com"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setEmail(event.target.value)
                }
                onBlur={() => setTouched(true)}
                className={visibleEmailError ? styles.inputError : undefined}
                aria-invalid={Boolean(visibleEmailError)}
              />
              {visibleEmailError ? (
                <small className={styles.errorText}>{visibleEmailError}</small>
              ) : (
                <small className={styles.helperText}>
                  Use the same email you sign in with on SkillSphere.
                </small>
              )}
            </label>

            {submitAttempted && emailError ? (
              <div className={styles.summaryBanner} role="alert">
                <AlertTriangle size={16} />
                <span>Fix the highlighted field before continuing.</span>
              </div>
            ) : null}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Sending reset link..." : "Send reset link"}
            </button>
          </form>

          <div className={styles.footer}>
            <span>
              Remembered your password? <Link to="/login">Back to sign in</Link>
            </span>
            <Link to="/register">Create account</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
