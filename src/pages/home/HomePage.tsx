import React, { useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import SkillDiscovery from "../../components/skillDiscovery/SkillDiscovery";

import styles from "./HomePage.module.scss";

const HomePage: React.FC = () => {
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
        <SkillDiscovery />
      </main>
    </div>
  );
};

export default HomePage;