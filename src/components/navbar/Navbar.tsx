import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import styles from "./Navbar.module.scss";
import { FiBell, FiMessageSquare, FiChevronDown } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { user, logout, loading } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [hideNav, setHideNav] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  const location = useLocation();
  const isExploreActive =
    location.pathname === "/" || location.pathname === "/explore";

  /* ================= SCROLL HIDE ================= */
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current && window.scrollY > 80) {
        setHideNav(true);
      } else {
        setHideNav(false);
      }
      lastScrollY.current = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className={`${styles.navbar} ${hideNav ? styles.hide : ""}`}>
        
        {/* LEFT */}
        <div className={styles.leftSection}>
          <button className={styles.hamburger} onClick={toggleSidebar}>
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={styles.logo}>
            <span className={styles.fullLogo}>
              <span>Skill</span>Share
            </span>
            <span className={styles.compactLogo}>SS</span>
          </div>
        </div>

        {/* CENTER */}
        <div className={styles.desktopLinks}>

          <NavLink
            to="/explore"
            className={({ isActive }) =>
              isActive || isExploreActive ? "active" : ""
            }
          >
            Explore
          </NavLink>

          <NavLink to="/sessions">Sessions</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>

          {/* ✅ Only show if NOT tutor */}
          {user && !user.isTutor && (
            <NavLink
              to="/become-tutor"
              className={styles.becomeTutor}
            >
              Become a Tutor
            </NavLink>
          )}

        </div>

        {/* RIGHT */}
        <div className={styles.actions}>

          <div className={styles.iconWrapper}>
            <FiBell className={styles.icon} />
            <span className={styles.badge}></span>
          </div>

          <div className={styles.iconWrapper}>
            <FiMessageSquare className={styles.icon} />
          </div>

          {loading ? (
            <div className={styles.skeleton}></div>
          ) : !user ? (
            <div className={styles.authButtons}>
              <NavLink to="/login" className={styles.loginBtn}>
                Login
              </NavLink>
              <NavLink to="/register" className={styles.registerBtn}>
                Register
              </NavLink>
            </div>
          ) : (
            <div
              className={styles.profile}
              ref={profileRef}
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <img
                src={user.profilePhoto || "https://i.pravatar.cc/40"}
                alt="profile"
              />

              <span className={styles.username}>{user.name}</span>

              {/* ✅ Tutor Badge */}
              {user.isTutor && (
                <span className={styles.tutorBadge}>Tutor</span>
              )}

              <FiChevronDown />

              {profileOpen && (
                <div className={styles.dropdown}>
                  <NavLink to="/profile">Profile</NavLink>
                  <NavLink to="/settings">Settings</NavLink>

                  {/* ✅ Conditional inside dropdown */}
                  {!user.isTutor && (
                    <NavLink to="/become-tutor">
                      Become Tutor
                    </NavLink>
                  )}

                  <button onClick={logout}>Logout</button>
                </div>
              )}
            </div>
          )}

        </div>
      </nav>

      {/* MOBILE NAV */}
      <div className={styles.bottomNav}>
        <NavLink
          to="/explore"
          className={({ isActive }) =>
            isActive || isExploreActive ? "active" : ""
          }
        >
          Explore
        </NavLink>

        <NavLink to="/sessions">Sessions</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>

        {/* ✅ Mobile Tutor CTA */}
        {user && !user.isTutor && (
          <NavLink to="/become-tutor">Tutor</NavLink>
        )}
      </div>
    </>
  );
};

export default Navbar;
