import React, { useEffect, useState } from "react";
import styles from "../dashboard/Dashboard.module.scss";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

import { getMySessions } from "../../services/session.service";
import { getMyActivity } from "../../services/activity.service";

import StatsCard from "./StatsCard";
import ActivityFeed from "./ActivityFeed";
import UpcomingSessions from "./UpcomingSessions";

/* 🔥 NEW */
import TutorSection from "./TutorSection";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const [sessions, setSessions] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsRes, activityRes] = await Promise.all([
          getMySessions(),
          getMyActivity(),
        ]);

        setSessions(sessionsRes);
        setActivity(activityRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ================= DERIVED ================= */

  const totalSessions = sessions.length;

  const completedSessions = sessions.filter(
    (s) => s.status === "completed"
  ).length;

  const upcomingSessions = sessions.filter(
    (s) => new Date(s.date) > new Date()
  );

  if (loading) return <div className={styles.loader}>Loading...</div>;

  return (
    <div className={styles.dashboard}>
      
      {/* HEADER */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>
          Welcome back, {user?.name} 👋
          {user?.isTutor && <span className={styles.tutorBadge}>Tutor</span>}
        </h1>
        <p>Track your learning and teaching journey</p>
      </motion.div>

      {/* ================= STATS ================= */}
      <div className={styles.statsGrid}>
        <StatsCard title="Total Sessions" value={totalSessions} />
        <StatsCard title="Completed" value={completedSessions} />
        <StatsCard title="Upcoming" value={upcomingSessions.length} />

        {/* 🔥 Tutor-specific stats */}
        {user?.isTutor && (
          <>
            <StatsCard title="Earnings" value="₹12,500" />
            <StatsCard title="Rating" value="4.8 ⭐" />
          </>
        )}
      </div>

      {/* ================= MAIN ================= */}
      <div className={styles.mainGrid}>
        <UpcomingSessions sessions={upcomingSessions} />
        <ActivityFeed activity={activity} />
      </div>

      {/* ================= TUTOR SECTION ================= */}
      {user?.isTutor && <TutorSection  />}
    </div>
  );
};

export default Dashboard;