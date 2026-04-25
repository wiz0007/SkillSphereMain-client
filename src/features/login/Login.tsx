import { useState, type ChangeEvent, type FormEvent } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
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
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={handleChange}
              />
            </label>

            <label className={styles.field}>
              <span>Password</span>
              <div className={styles.passwordField}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  required
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

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className={styles.footer}>
            Do not have an account?{" "}
            <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
