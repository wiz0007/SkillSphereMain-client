import React, {
  useState,
  useEffect,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Register.module.scss";
import {
  registerUser,
  verifyOTP,
  resendOTP,
  checkUsername,
} from "../../services/auth.service";

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const checks = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
    special: /[@$!%*?&]/.test(form.password),
  };

  const isPasswordValid = Object.values(checks).every(Boolean);
  const isMatch =
    form.confirmPassword.length > 0 &&
    form.password === form.confirmPassword;

  useEffect(() => {
    if (!form.username.trim()) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");

    const timer = setTimeout(async () => {
      try {
        const res = await checkUsername(form.username.trim());
        setUsernameStatus(res.available ? "available" : "taken");
      } catch {
        setUsernameStatus("idle");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [form.username]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const interval = setInterval(() => {
      setCooldown((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback("");

    if (!isPasswordValid) {
      setFeedback("Password does not meet the required strength.");
      return;
    }

    if (!isMatch) {
      setFeedback("Passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setFeedback("Please accept the terms to continue.");
      return;
    }

    if (usernameStatus !== "available") {
      setFeedback("Choose an available username before creating the account.");
      return;
    }

    try {
      setLoading(true);

      const res = await registerUser({
        username: form.username.trim(),
        email: form.email,
        password: form.password,
      });

      setUserId(res.userId);
      setIsOtpStep(true);
      setCooldown(30);
      setFeedback("We sent a verification code to your email.");
    } catch (err: any) {
      setFeedback(
        err?.response?.data?.message || "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setFeedback("Enter the verification code first.");
      return;
    }

    try {
      setLoading(true);
      await verifyOTP({ userId: userId!, otp: otp.trim() });
      navigate("/login");
    } catch (err: any) {
      setFeedback(err?.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !userId) return;

    try {
      await resendOTP({ userId });
      setCooldown(30);
      setFeedback("A new verification code has been sent.");
    } catch {
      setFeedback("Failed to resend OTP.");
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.hero}>
          <p className={styles.kicker}>
            {isOtpStep ? "Verify Account" : "Create Account"}
          </p>
          <h1>
            {isOtpStep
              ? "Finish verification and step into your workspace."
              : "Start learning, teaching, and booking sessions in one place."}
          </h1>
          <p className={styles.subtitle}>
            {isOtpStep
              ? "Use the code from your inbox to activate the account you just created."
              : "Build your profile once, then move through the dashboard, sessions, and tutor tools with a single consistent flow."}
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>{isOtpStep ? "Verify OTP" : "Set up your account"}</h2>
            <p>
              {isOtpStep
                ? "Verification helps keep the platform clean and secure."
                : "A few details now and the rest of your profile comes next."}
            </p>
          </div>

          {feedback ? (
            <div className={styles.feedbackBanner}>{feedback}</div>
          ) : null}

          {!isOtpStep ? (
            <form onSubmit={handleSubmit} className={styles.form}>
              <label className={styles.field}>
                <span>Username</span>
                <input
                  name="username"
                  placeholder="Choose a username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
                <small className={styles.inlineHint}>
                  {usernameStatus === "checking" &&
                    "Checking availability..."}
                  {usernameStatus === "available" &&
                    "Username is available."}
                  {usernameStatus === "taken" &&
                    "That username is already taken."}
                  {usernameStatus === "idle" &&
                    "Letters, numbers, and underscores work best."}
                </small>
              </label>

              <label className={styles.field}>
                <span>Email address</span>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className={styles.field}>
                <span>Password</span>
                <div className={styles.passwordField}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </label>

              <div className={styles.passwordRules}>
                <span className={checks.length ? styles.valid : ""}>
                  8+ characters
                </span>
                <span className={checks.upper ? styles.valid : ""}>
                  uppercase
                </span>
                <span className={checks.lower ? styles.valid : ""}>
                  lowercase
                </span>
                <span className={checks.number ? styles.valid : ""}>
                  number
                </span>
                <span className={checks.special ? styles.valid : ""}>
                  special char
                </span>
              </div>

              <label className={styles.field}>
                <span>Confirm password</span>
                <div className={styles.passwordField}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() =>
                      setShowConfirm((previous) => !previous)
                    }
                  >
                    {showConfirm ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {form.confirmPassword ? (
                  <small className={styles.inlineHint}>
                    {isMatch
                      ? "Passwords match."
                      : "Passwords do not match yet."}
                  </small>
                ) : null}
              </label>

              <label className={styles.termsRow}>
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) =>
                    setAcceptedTerms(event.target.checked)
                  }
                />
                <span>
                  I agree to the{" "}
                  <button
                    type="button"
                    className={styles.inlineLink}
                    onClick={() => setShowTerms(true)}
                  >
                    Terms and Conditions
                  </button>
                  .
                </span>
              </label>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={
                  loading ||
                  !isPasswordValid ||
                  !isMatch ||
                  !acceptedTerms ||
                  usernameStatus !== "available"
                }
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>
          ) : (
            <div className={styles.form}>
              <label className={styles.field}>
                <span>Verification code</span>
                <input
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="Enter the OTP from your email"
                />
              </label>

              <button
                type="button"
                className={styles.submitButton}
                onClick={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify account"}
              </button>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleResend}
                disabled={cooldown > 0}
              >
                {cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Resend OTP"}
              </button>
            </div>
          )}

          {!isOtpStep ? (
            <p className={styles.footer}>
              Already have an account?{" "}
              <Link to="/login">Sign in</Link>
            </p>
          ) : null}
        </div>
      </div>

      {showTerms ? (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Terms and Conditions</h3>
            <p>
              By creating an account, you agree to use the
              platform responsibly, provide accurate profile
              information, and respect the people you learn with.
            </p>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setShowTerms(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default Register;
