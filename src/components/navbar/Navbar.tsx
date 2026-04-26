import React, { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiMessageSquare } from "react-icons/fi";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NavbarBell from "./NavbarBell";
import styles from "./Navbar.module.scss";

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [hideNav, setHideNav] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  const location = useLocation();
  const isExploreActive =
    location.pathname === "/" || location.pathname === "/explore";

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className={`${styles.navbar} ${hideNav ? styles.hide : ""}`}>
        <div className={styles.leftSection}>
          <button
            type="button"
            className={styles.hamburger}
            onClick={onToggleSidebar}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={styles.logo}>
            <span className={styles.fullLogo}>
              <span>Skill</span>Sphere
            </span>
            <span className={styles.compactLogo}>SS</span>
          </div>
        </div>

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

          {user && !user.isTutor ? (
            <NavLink
              to="/become-tutor"
              className={styles.becomeTutor}
            >
              Become a Tutor
            </NavLink>
          ) : null}
        </div>

        <div className={styles.actions}>
          <div className={styles.iconWrapper}>
            <NavbarBell />
          </div>

          <button
            type="button"
            className={styles.iconWrapper}
            onClick={() => navigate("/messages")}
            aria-label="Open messages"
          >
            <FiMessageSquare className={styles.icon} />
          </button>

          {loading ? (
            <div className={styles.skeleton}></div>
          ) : !user ? (
            <div className={styles.authButtons}>
              <NavLink to="/login" className={styles.loginBtn}>
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={styles.registerBtn}
              >
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

              <span className={styles.username}>{user.username}</span>

              {user.isTutor ? (
                <span className={styles.tutorBadge}>Tutor</span>
              ) : null}

              <FiChevronDown />

              {profileOpen ? (
                <div className={styles.dropdown}>
                  <NavLink to="/profile">Profile</NavLink>
                  <NavLink to="/settings">Settings</NavLink>

                  {!user.isTutor ? (
                    <NavLink to="/become-tutor">
                      Become Tutor
                    </NavLink>
                  ) : null}

                  <button onClick={logout}>Logout</button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </nav>

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

        {user && !user.isTutor ? (
          <NavLink to="/become-tutor">Tutor</NavLink>
        ) : null}
      </div>
    </>
  );
};

export default Navbar;
