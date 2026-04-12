import { Link } from "react-router-dom";
import styles from "./AuthNavbar.module.scss";

export function AuthNavbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logoSection}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>SkillSphere</span>
        </Link>
      </div>
    </nav>
  );
}