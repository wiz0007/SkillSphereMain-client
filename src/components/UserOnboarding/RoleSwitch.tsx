import styles from "./UserOnboarding.module.scss";
import type { Role } from "./onboarding.types";

interface Props {
  role: Role;
  setRole: (role: Role) => void;
}

export default function RoleSwitch({ role, setRole }: Props) {
  return (
    <div className={styles.roleSwitch}>
      <button
        type="button"
        className={role === "student" ? styles.active : ""}
        onClick={() => setRole("student")}
      >
        Student
      </button>

      <button
        type="button"
        className={role === "teacher" ? styles.active : ""}
        onClick={() => setRole("teacher")}
      >
        Teacher
      </button>
    </div>
  );
}