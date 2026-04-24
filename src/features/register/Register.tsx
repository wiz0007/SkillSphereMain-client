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
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* 🔥 COOLDOWN STATE */
  const [cooldown, setCooldown] = useState(0);

  /* ================= PASSWORD RULES ================= */

  const checks = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
    special: /[@$!%*?&]/.test(form.password),
  };

  const isPasswordValid = Object.values(checks).every(Boolean);
  const isMatch =
    form.confirmPassword && form.password === form.confirmPassword;

  /* ================= USERNAME CHECK ================= */

  useEffect(() => {
    if (!form.username) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");

    const timer = setTimeout(async () => {
      try {
        const res = await checkUsername(form.username);
        setUsernameStatus(res.available ? "available" : "taken");
      } catch {
        setUsernameStatus("idle");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form.username]);

  /* ================= COOLDOWN TIMER ================= */

  useEffect(() => {
    if (cooldown <= 0) return;

    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  /* ================= HANDLERS ================= */

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= REGISTER ================= */

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid)
      return setError("Password does not meet requirements");

    if (!isMatch) return setError("Passwords do not match");

    if (!acceptedTerms) return setError("Please accept Terms & Conditions");

    if (usernameStatus !== "available")
      return setError("Username not available");

    try {
      setLoading(true);

      const res = await registerUser({
        username: form.username,
        email: form.email,
        password: form.password,
      });

      setUserId(res.userId);
      setIsOtpStep(true);

      /* 🔥 START COOLDOWN */
      setCooldown(30);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= OTP ================= */

  const handleVerifyOtp = async () => {
    if (!otp) return setError("Enter OTP");

    try {
      setLoading(true);
      await verifyOTP({ userId: userId!, otp });
      alert("Account verified!");
      navigate("/login");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    try {
      await resendOTP({ userId: userId! });
      alert("OTP resent");

      /* 🔥 RESET COOLDOWN */
      setCooldown(30);
    } catch {
      alert("Failed to resend OTP");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          {isOtpStep ? "Verify OTP" : "Create Account"}
        </h1>

        {error && <p className={styles.error}>{error}</p>}

        {!isOtpStep ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />

            <p className={styles.status}>
              {usernameStatus === "checking" && "Checking..."}
              {usernameStatus === "available" && "✅ Available"}
              {usernameStatus === "taken" && "❌ Username taken"}
            </p>

            <input
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />

            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
              />
              <span
                className={styles.eye}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>

            <div className={styles.passwordRules}>
              <p className={checks.length ? styles.valid : ""}>
                ✔ At least 8 characters
              </p>
              <p className={checks.upper ? styles.valid : ""}>
                ✔ One uppercase letter
              </p>
              <p className={checks.lower ? styles.valid : ""}>
                ✔ One lowercase letter
              </p>
              <p className={checks.number ? styles.valid : ""}>✔ One number</p>
              <p className={checks.special ? styles.valid : ""}>
                ✔ One special character
              </p>
            </div>

            <div className={styles.passwordContainer}>
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
              <span
                className={styles.eye}
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>

            {form.confirmPassword && (
              <p className={isMatch ? styles.valid : styles.error}>
                {isMatch ? "✔ Passwords match" : "✖ Passwords do not match"}
              </p>
            )}

            <div className={styles.terms}>
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />

              <label htmlFor="terms">
                I agree to{" "}
                <span
                  className={styles.link}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTerms(true);
                  }}
                >
                  Terms & Conditions
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                !isPasswordValid ||
                !isMatch ||
                !acceptedTerms ||
                usernameStatus !== "available"
              }
            >
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>
        ) : (
          <div className={styles.form}>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
            />

            <button onClick={handleVerifyOtp} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
            </button>
          </div>
        )}

        {!isOtpStep && (
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        )}

        {showTerms && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Terms & Conditions</h2>
              <p>Put your legal content here...</p>
              <button onClick={() => setShowTerms(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
