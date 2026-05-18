import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { sidebarItems } from "../sidebar/sidebarData";
import styles from "./Sidebar.module.scss";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const items = user?.isAdmin
    ? [
        ...sidebarItems,
        {
          id: 999,
          title: "Admin Portal",
          icon: "ri-shield-star-line",
          route: "/admin",
        },
      ]
    : sidebarItems;

  return (
    <>
      <div
        className={`${styles.overlay} ${
          isOpen ? styles.showOverlay : ""
        }`}
        onClick={onToggle}
      />

      <aside
        className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
      >
        <div className={styles.logoArea}>
          <span className={styles.logo}>
            <span>Skill</span>Sphere
          </span>

          <button
            type="button"
            className={styles.toggleBtn}
            onClick={onToggle}
          >
            <i className="ri-menu-line" />
          </button>
        </div>

        <nav className={styles.menu}>
          {items.map((item) => {
            const isActive = location.pathname.startsWith(item.route);

            return (
              <div
                key={item.id}
                className={`${styles.menuItem} ${
                  isActive ? styles.active : ""
                }`}
                onClick={() => {
                  navigate(item.route);

                  if (window.innerWidth <= 1024) {
                    onToggle();
                  }
                }}
              >
                <i className={`${item.icon} ${styles.icon}`} />
                <span className={styles.title}>{item.title}</span>
              </div>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <div className={styles.logout} onClick={logout}>
            <i className="ri-logout-box-r-line" />
            <span>Logout</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
