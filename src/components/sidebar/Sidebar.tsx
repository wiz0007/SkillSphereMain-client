import React, { useState } from "react";
import styles from "./Sidebar.module.scss";
import { sidebarItems } from "../sidebar/sidebarData";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const [active, setActive] = useState<number>(1);

  return (
    <>
      <div
        className={`${styles.overlay} ${
          isCollapsed ? styles.showOverlay : ""
        }`}
        onClick={toggleSidebar}
      />

      <aside
        className={`${styles.sidebar} ${
          isCollapsed ? styles.collapsed : ""
        }`}
      >
        <div className={styles.logoArea}>
          <span className={styles.logo}>SkillX</span>

          <button
            className={styles.toggleBtn}
            onClick={toggleSidebar}
          >
            <i className="ri-menu-line" />
          </button>
        </div>

        <nav className={styles.menu}>
          {sidebarItems.map((item) => (
            <div
              key={item.id}
              className={`${styles.menuItem} ${
                active === item.id ? styles.active : ""
              }`}
              onClick={() => setActive(item.id)}
            >
              <i className={`${item.icon} ${styles.icon}`} />

              <span className={styles.title}>{item.title}</span>
            </div>
          ))}
        </nav>

        <div className={styles.footer}>
          <div className={styles.logout}>
            <i className="ri-logout-box-r-line" />
            <span>Logout</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;