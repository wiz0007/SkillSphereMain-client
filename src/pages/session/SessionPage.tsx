import React, { useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Sessions from "../../components/sessions/Sessions";

import styles from "../Page.module.scss"

const SessionPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className={styles.layout}>
      <Navbar toggleSidebar={toggleSidebar} />

      <Sidebar isCollapsed={!sidebarOpen} toggleSidebar={toggleSidebar} />

      <main
        className={`${styles.main} ${
          sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}
      >
        <Sessions />
      </main>
    </div>
  );
};

export default SessionPage;