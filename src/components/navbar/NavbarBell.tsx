import { FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import styles from "./Navbar.module.scss";
import { useNotifications } from "../../context/NotificationContext";

const NavbarBell = () => {
  const navigate = useNavigate();

  // ✅ CENTRALIZED STATE
  const { count } = useNotifications();

  return (
    <div
      className={styles.iconWrapper}
      onClick={() => navigate("/notifications")}
    >
      <FiBell className={styles.icon} />

      {count > 0 && (
        <span className={styles.badge}>{count}</span>
      )}
    </div>
  );
};

export default NavbarBell;