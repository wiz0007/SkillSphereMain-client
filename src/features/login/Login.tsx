import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import styles from "./Login.module.scss";
import { loginUser } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";

interface LoginForm {
  email: string;
  password: string;
}

export function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touched, setTouched] = useState<
    Partial<Record<keyof LoginForm, boolean>>
  >({});

  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const validationErrors = useMemo(
    () => ({
      email: !form.email.trim()
        ? "Enter your email address."
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
          ? "Enter a valid email address."
          : "",
      password: !form.password
        ? "Enter your password."
        : form.password.length < 6
          ? "Password must be at least 6 characters."
          : "",
    }),
    [form.email, form.password]
  );

  const visibleErrors = {
    email:
      touched.email || submitAttempted ? validationErrors.email : "",
    password:
      touched.password || submitAttempted
        ? validationErrors.password
        : "",
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitAttempted(true);
    setTouched({ email: true, password: true });

    if (validationErrors.email || validationErrors.password) {
      if (validationErrors.email) {
        emailRef.current?.focus();
      } else if (validationErrors.password) {
        passwordRef.current?.focus();
      }
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(form);
      const { token, user } = data;

      localStorage.setItem("token", token);
      setUser(user);

      navigate(user.profileCompleted ? "/" : "/userDetails");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.hero}>
          <p className={styles.kicker}>Welcome Back</p>
          <h1>Pick up exactly where your last session left off.</h1>
          <p className={styles.subtitle}>
            Access your dashboard, bookings, saved courses,
            and teaching workspace from one place.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Sign in</h2>
            <p>Use your account details to enter SkillSphere.</p>
          </div>

          {error ? (
            <div className={styles.errorBanner}>{error}</div>
          ) : null}

          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.field}>
              <span>Email address</span>
              <input
                ref={emailRef}
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                onBlur={() =>
                  setTouched((previous) => ({
                    ...previous,
                    email: true,
                  }))
                }
                aria-invalid={Boolean(visibleErrors.email)}
                className={
                  visibleErrors.email ? styles.inputError : undefined
                }
              />
              {visibleErrors.email ? (
                <small className={styles.errorText}>
                  {visibleErrors.email}
                </small>
              ) : (
                <small className={styles.helperText}>
                  Use the email address linked to your SkillSphere account.
                </small>
              )}
            </label>

            <label className={styles.field}>
              <span>Password</span>
              <div className={styles.passwordField}>
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={() =>
                    setTouched((previous) => ({
                      ...previous,
                      password: true,
                    }))
                  }
                  aria-invalid={Boolean(visibleErrors.password)}
                  className={
                    visibleErrors.password
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
              {visibleErrors.password ? (
                <small className={styles.errorText}>
                  {visibleErrors.password}
                </small>
              ) : (
                <small className={styles.helperText}>
                  Your password stays private and only unlocks your workspace.
                </small>
              )}
            </label>

            {submitAttempted &&
            (validationErrors.email || validationErrors.password) ? (
              <div className={styles.summaryBanner} role="alert">
                <AlertTriangle size={16} />
                <span>
                  Fix the highlighted sign-in fields before continuing.
                </span>
              </div>
            ) : null}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className={styles.footer}>
            <Link to="/forgot-password">Forgot your password?</Link>
          </p>

          <p className={styles.footer}>
            Do not have an account?{" "}
            <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
