import { useState, type ChangeEvent, type FormEvent } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Register.module.scss";
import {
  registerUser,
  verifyOTP,
  resendOTP,
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= REGISTER ================= */

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!passwordRegex.test(form.password)) {
      setError(
        "Password must contain uppercase, lowercase, number & special character"
      );
      return;
    }

    try {
      setLoading(true);

      const res = await registerUser({
        username: form.username,
        email: form.email,
        password: form.password,
      });

      setUserId(res.userId);
      setIsOtpStep(true); // ✅ switch to OTP

    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY OTP ================= */

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Enter OTP");
      return;
    }

    try {
      setLoading(true);

      await verifyOTP({
        userId: userId!,
        otp,
      });

      alert("Account verified!");
      navigate("/login");

    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESEND OTP ================= */

  const handleResend = async () => {
    try {
      await resendOTP({ userId: userId! });
      alert("OTP resent");
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
              type="text"
              name="username"
              placeholder="Username"
              required
              value={form.username}
              onChange={handleChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              value={form.email}
              onChange={handleChange}
            />

            {/* Password */}
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                required
                value={form.password}
                onChange={handleChange}
              />

              <span
                className={styles.eye}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>

            {/* Confirm Password */}
            <div className={styles.passwordContainer}>
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
              />

              <span
                className={styles.eye}
                onClick={() => setShowConfirm((prev) => !prev)}
              >
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Sign Up"}
            </button>

          </form>
        ) : (
          /* OTP SECTION */
          <div className={styles.form}>

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button onClick={handleVerifyOtp} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              className={styles.resend}
              onClick={handleResend}
            >
              Resend OTP
            </button>

          </div>
        )}

        {!isOtpStep && (
          <p>
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>
        )}

      </div>
    </div>
  );
};

export default Register;