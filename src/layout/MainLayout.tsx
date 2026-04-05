import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import styles from "./Page.module.scss";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={styles.layout}>
      <Navbar toggleSidebar={() => setSidebarOpen(prev => !prev)} />

      <Sidebar
        isCollapsed={!sidebarOpen}
        toggleSidebar={() => setSidebarOpen(prev => !prev)}
      />

      <main
        className={`${styles.main} ${
          sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;