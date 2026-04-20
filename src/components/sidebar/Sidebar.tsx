import React from "react";
import styles from "./Sidebar.module.scss";
import { sidebarItems } from "../sidebar/sidebarData";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  toggleSidebar,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <>
      {/* OVERLAY */}
      <div
        className={`${styles.overlay} ${
          isCollapsed ? styles.showOverlay : ""
        }`}
        onClick={toggleSidebar}
      />

      {/* SIDEBAR */}
      <aside
        className={`${styles.sidebar} ${
          isCollapsed ? styles.open : ""
        }`}
      >
        {/* HEADER */}
        <div className={styles.logoArea}>
          <span className={styles.logo}>
            <span>Skill</span>Sphere
          </span>

          <button
            className={styles.toggleBtn}
            onClick={toggleSidebar}
          >
            <i className="ri-menu-line" />
          </button>
        </div>

        {/* MENU */}
        <nav className={styles.menu}>
          {sidebarItems.map((item) => {
            const isActive = location.pathname.startsWith(item.route);

            return (
              <div
                key={item.id}
                className={`${styles.menuItem} ${
                  isActive ? styles.active : ""
                }`}
                onClick={() => {
                  navigate(item.route);
                  toggleSidebar();
                }}
              >
                <i className={`${item.icon} ${styles.icon}`} />
                <span className={styles.title}>{item.title}</span>
              </div>
            );
          })}
        </nav>

        {/* FOOTER */}
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