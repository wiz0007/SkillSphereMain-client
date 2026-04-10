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
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      const data = await loginUser(form);

      /*
      Backend Response
      {
        token: "...",
        user: { _id, email, profileCompleted }
      }
      */

      const { token, user } = data;

      // ✅ ONLY store token here
      localStorage.setItem("token", token);

      // ✅ Let AuthContext handle user persistence
      setUser(user);

      // ✅ Redirect logic
      if (user.profileCompleted) {
        navigate("/");
      } else {
        navigate("/userdetails");
      }

    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>

        <h1 className={styles.title}>Welcome Back</h1>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            value={form.email}
            onChange={handleChange}
          />

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
              onClick={() =>
                setShowPassword((prev) => !prev)
              }
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

        <p>
          Don’t have an account?{" "}
          <Link to="/register">Register</Link>
        </p>

      </div>
    </div>
  );
}