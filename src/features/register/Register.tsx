import {
  useState,
  useEffect,
  useMemo,
  useRef,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Register.module.scss";
import {
  registerUser,
  verifyOTP,
  resendOTP,
  checkUsername,
} from "../../services/auth.service";
import SocialAuthButtons from "../../components/auth/SocialAuthButtons";

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
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
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error">(
    "error"
  );
  const [touched, setTouched] = useState<
    Partial<Record<keyof RegisterForm | "terms" | "otp", boolean>>
  >({});

  const feedbackRef = useRef<HTMLDivElement | null>(null);
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null);
  const otpRef = useRef<HTMLInputElement | null>(null);

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

  const scrollToWarning = (target: HTMLElement | null) => {
    window.requestAnimationFrame(() => {
      target?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  };

  const showFeedback = (
    message: string,
    tone: "success" | "error" = "error"
  ) => {
    setFeedbackTone(tone);
    setFeedback(message);
  };

  const validationErrors = useMemo(
    () => ({
      username: !form.username.trim()
        ? "Choose a username."
        : /\s/.test(form.username)
          ? "Spaces are not allowed in usernames."
          : /[A-Z]/.test(form.username)
            ? "Capital letters are not allowed. Use lowercase only."
            : !/^[a-z0-9_]+$/.test(form.username.trim())
              ? "Use lowercase letters, numbers, and underscores only."
          : form.username.trim().length < 3
            ? "Username must be at least 3 characters."
            : usernameStatus === "taken"
              ? "That username is already taken."
              : "",
      email: !form.email.trim()
        ? "Enter your email address."
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
          ? "Enter a valid email address."
          : "",
      password: !form.password
        ? "Create a password."
        : !isPasswordValid
          ? "Password does not meet the required strength."
          : "",
      confirmPassword: !form.confirmPassword
        ? "Confirm your password."
        : !isMatch
          ? "Passwords do not match."
          : "",
      terms: acceptedTerms ? "" : "Accept the terms to continue.",
      otp: !otp.trim() ? "Enter the verification code first." : "",
    }),
    [
      acceptedTerms,
      form.confirmPassword,
      form.email,
      form.password,
      form.username,
      isMatch,
      isPasswordValid,
      otp,
      usernameStatus,
    ]
  );

  const visibleError = (
    field: keyof typeof validationErrors
  ) => ((touched[field] || submitAttempted) ? validationErrors[field] : "");

  const hasBlockingErrors = Boolean(
    validationErrors.username ||
      validationErrors.email ||
      validationErrors.password ||
      validationErrors.confirmPassword ||
      validationErrors.terms
  );

  useEffect(() => {
    if (feedback) {
      scrollToWarning(feedbackRef.current);
    }
  }, [feedback]);

  useEffect(() => {
    if (submitAttempted && hasBlockingErrors) {
      scrollToWarning(summaryRef.current);
    }
  }, [hasBlockingErrors, submitAttempted]);

  useEffect(() => {
    const normalizedUsername = form.username.trim().toLowerCase();

    if (!form.username.trim()) {
      setUsernameStatus("idle");
      return;
    }

    if (
      /\s/.test(form.username) ||
      /[A-Z]/.test(form.username) ||
      !/^[a-z0-9_]+$/.test(normalizedUsername) ||
      normalizedUsername.length < 3
    ) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");

    const timer = setTimeout(async () => {
      try {
        const res = await checkUsername(normalizedUsername);
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
    setFeedbackTone("error");
    setSubmitAttempted(true);
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
      terms: true,
    });

    if (validationErrors.username) {
      usernameRef.current?.focus();
      scrollToWarning(summaryRef.current || usernameRef.current);
      return;
    }

    if (validationErrors.email) {
      emailRef.current?.focus();
      scrollToWarning(summaryRef.current || emailRef.current);
      return;
    }

    if (validationErrors.password) {
      passwordRef.current?.focus();
      scrollToWarning(summaryRef.current || passwordRef.current);
      return;
    }

    if (validationErrors.confirmPassword) {
      confirmPasswordRef.current?.focus();
      scrollToWarning(summaryRef.current || confirmPasswordRef.current);
      return;
    }

    if (validationErrors.terms) {
      scrollToWarning(summaryRef.current);
      return;
    }

    if (usernameStatus !== "available") {
      showFeedback("Choose an available username before creating the account.");
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
      showFeedback("We sent a verification code to your email.", "success");
    } catch (err: any) {
      showFeedback(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setTouched((previous) => ({ ...previous, otp: true }));

    if (validationErrors.otp) {
      otpRef.current?.focus();
      scrollToWarning(otpRef.current);
      return;
    }

    try {
      setLoading(true);
      await verifyOTP({ userId: userId!, otp: otp.trim() });
      navigate("/login");
    } catch (err: any) {
      showFeedback(err?.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !userId) return;

    try {
      await resendOTP({ userId });
      setCooldown(30);
      showFeedback("A new verification code has been sent.", "success");
    } catch {
      showFeedback("Failed to resend OTP.");
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>{isOtpStep ? "Verify OTP" : "Set up your account"}</h2>
            <p>
              {isOtpStep
                ? "Verification helps keep the platform clean and secure."
                : "Keep it clean: username, email, password, then OTP verification."}
            </p>
          </div>

          {feedback ? (
            <div
              ref={feedbackRef}
              className={`${styles.feedbackBanner} ${
                feedbackTone === "error"
                  ? styles.feedbackError
                  : styles.feedbackSuccess
              }`}
              role={feedbackTone === "error" ? "alert" : "status"}
              tabIndex={-1}
            >
              {feedbackTone === "error" ? <AlertTriangle size={17} /> : null}
              <span>{feedback}</span>
            </div>
          ) : null}

          {!isOtpStep ? (
            <>
              <form onSubmit={handleSubmit} className={styles.form}>
              <label className={styles.field}>
                <span>Username</span>
                <input
                  ref={usernameRef}
                  name="username"
                  placeholder="Choose a username"
                  value={form.username}
                  onChange={handleChange}
                  onBlur={() =>
                    setTouched((previous) => ({
                      ...previous,
                      username: true,
                    }))
                  }
                  aria-invalid={Boolean(visibleError("username"))}
                  className={
                    visibleError("username")
                      ? styles.inputError
                      : undefined
                  }
                />
                <small className={styles.inlineHint}>
                  {visibleError("username")
                    ? visibleError("username")
                    : usernameStatus === "checking"
                      ? "Checking availability..."
                      : usernameStatus === "available"
                        ? "Username is available."
                        : "Use lowercase letters, numbers, and underscores only."}
                </small>
              </label>

              <label className={styles.field}>
                <span>Email address</span>
                <input
                  ref={emailRef}
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={() =>
                    setTouched((previous) => ({
                      ...previous,
                      email: true,
                    }))
                  }
                  aria-invalid={Boolean(visibleError("email"))}
                  className={
                    visibleError("email")
                      ? styles.inputError
                      : undefined
                  }
                />
                {visibleError("email") ? (
                  <small className={styles.inlineHint}>
                    {visibleError("email")}
                  </small>
                ) : null}
              </label>

              <label className={styles.field}>
                <span>Password</span>
                <div className={styles.passwordField}>
                  <input
                    ref={passwordRef}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={() =>
                      setTouched((previous) => ({
                        ...previous,
                        password: true,
                      }))
                    }
                    aria-invalid={Boolean(visibleError("password"))}
                    className={
                      visibleError("password")
                        ? styles.inputError
                        : undefined
                    }
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
              {visibleError("password") ? (
                <small className={styles.inlineHint}>
                  {visibleError("password")}
                </small>
              ) : null}

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
                    ref={confirmPasswordRef}
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onBlur={() =>
                      setTouched((previous) => ({
                        ...previous,
                        confirmPassword: true,
                      }))
                    }
                    aria-invalid={Boolean(
                      visibleError("confirmPassword")
                    )}
                    className={
                      visibleError("confirmPassword")
                        ? styles.inputError
                        : undefined
                    }
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
                    {visibleError("confirmPassword") ||
                      (isMatch
                      ? "Passwords match."
                      : "Passwords do not match yet.")}
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
                  onBlur={() =>
                    setTouched((previous) => ({
                      ...previous,
                      terms: true,
                    }))
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
              {visibleError("terms") ? (
                <small className={styles.inlineHint}>
                  {visibleError("terms")}
                </small>
              ) : null}

              {submitAttempted && hasBlockingErrors ? (
                <div
                  ref={summaryRef}
                  className={styles.summaryBanner}
                  role="alert"
                  tabIndex={-1}
                >
                  <AlertTriangle size={16} />
                  <span>
                    Fix the highlighted fields before creating the
                    account.
                  </span>
                </div>
              ) : null}

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
              <SocialAuthButtons />
            </>
          ) : (
            <div className={styles.form}>
              <label className={styles.field}>
                <span>Verification code</span>
                <input
                  ref={otpRef}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  onBlur={() =>
                    setTouched((previous) => ({
                      ...previous,
                      otp: true,
                    }))
                  }
                  placeholder="Enter the OTP from your email"
                  aria-invalid={Boolean(visibleError("otp"))}
                  className={
                    visibleError("otp") ? styles.inputError : undefined
                  }
                />
                {visibleError("otp") ? (
                  <small className={styles.inlineHint}>
                    {visibleError("otp")}
                  </small>
                ) : null}
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


