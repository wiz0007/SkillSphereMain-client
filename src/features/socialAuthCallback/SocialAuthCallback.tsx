import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";
import styles from "./SocialAuthCallback.module.scss";

const SocialAuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [error, setError] = useState("");

  const hashParams = useMemo(() => {
    const rawHash = window.location.hash.replace(/^#/, "");
    return new URLSearchParams(rawHash);
  }, []);

  useEffect(() => {
    const run = async () => {
      const token = hashParams.get("token");
      const callbackError = hashParams.get("error");
      const profileCompleted = hashParams.get("profileCompleted") === "true";

      if (callbackError) {
        setError(
          decodeURIComponent(callbackError).replace(/_/g, " ")
        );
        return;
      }

      if (!token) {
        setError("Social sign-in could not be completed.");
        return;
      }

      try {
        localStorage.setItem("token", token);
        const { user } = await getCurrentUser();
        setUser(user);
        navigate(profileCompleted ? "/" : "/userDetails", {
          replace: true,
        });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError("We could not complete the social sign-in session.");
      }
    };

    void run();
  }, [hashParams, navigate, setUser]);

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h1>{error ? "Social sign-in failed" : "Connecting your account"}</h1>
        <p>
          {error
            ? error
            : "We’re finalizing your SkillSphere sign-in and preparing your workspace."}
        </p>

        {error ? (
          <Link to="/login" className={styles.button}>
            Back to login
          </Link>
        ) : (
          <div className={styles.loader} aria-hidden="true" />
        )}
      </div>
    </section>
  );
};

export default SocialAuthCallback;
