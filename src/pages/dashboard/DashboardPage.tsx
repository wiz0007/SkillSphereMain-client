import Navbar from "../../components/navbar/Navbar";
import Dashboard from "../../components/dashboard/Dashboard";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "../Page.module.scss";

import { useState } from "react";

const DashboardPage = () => {
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
      ></main>
      <Dashboard />
    </div>
  );
};

export default DashboardPage;
