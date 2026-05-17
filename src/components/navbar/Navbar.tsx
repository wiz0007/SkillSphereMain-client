import React, { useEffect, useRef, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { FiChevronDown, FiMessageSquare } from "react-icons/fi";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NavbarBell from "./NavbarBell";
import SkillCoinWallet from "./SkillCoinWallet";
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
  const showVerifiedTick =
    !!user &&
    (user.isAdmin ||
      ["identity", "tutor"].includes(user.verifiedBadgeLevel));

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
          <NavLink to="/help-center">Help</NavLink>

          {user && (!user.isTutor || user.tutorVerificationStatus !== "approved") ? (
            <NavLink
              to="/become-tutor"
              className={styles.becomeTutor}
            >
              {user.isTutor ? "Tutor Verification" : "Become a Tutor"}
            </NavLink>
          ) : null}
        </div>

        <div className={styles.actions}>
          {user ? <SkillCoinWallet /> : null}

          {user ? (
            <>
              <div
                className={`${styles.iconWrapper} ${styles.mobileAuxAction}`}
              >
                <NavbarBell />
              </div>

              <button
                type="button"
                className={`${styles.iconWrapper} ${styles.mobileAuxAction}`}
                onClick={() => navigate("/messages")}
                aria-label="Open messages"
              >
                <FiMessageSquare className={styles.icon} />
              </button>
            </>
          ) : null}

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

              {showVerifiedTick ? (
                <span
                  className={`${styles.verifiedTick} ${
                    user.isAdmin ? styles.adminTick : ""
                  }`}
                  aria-label={user.isAdmin ? "Admin" : "Verified user"}
                  title={user.isAdmin ? "Admin" : "Verified user"}
                >
                  <BadgeCheck size={16} />
                </span>
              ) : null}

              {user.tutorVerificationStatus === "approved" ? (
                <span className={styles.tutorBadge}>Tutor</span>
              ) : null}

              <FiChevronDown />

              {profileOpen ? (
                <div className={styles.dropdown}>
                  <NavLink to="/profile">Profile</NavLink>
                  <NavLink to="/help-center">Help Center</NavLink>
                  <NavLink to="/support">Support</NavLink>
                  <NavLink
                    to="/notifications"
                    className={styles.mobileMenuOnly}
                  >
                    Notifications
                  </NavLink>
                  <NavLink
                    to="/messages"
                    className={styles.mobileMenuOnly}
                  >
                    Messages
                  </NavLink>
                  <NavLink to="/settings">Settings</NavLink>

                  {!user.isTutor || user.tutorVerificationStatus !== "approved" ? (
                    <NavLink to="/become-tutor">
                      {user.isTutor ? "Tutor Verification" : "Become Tutor"}
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

        {user && (!user.isTutor || user.tutorVerificationStatus !== "approved") ? (
          <NavLink to="/become-tutor">
            {user.isTutor ? "Verify" : "Tutor"}
          </NavLink>
        ) : null}
      </div>
    </>
  );
};

export default Navbar;
