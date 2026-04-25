import React, { useEffect, useMemo, useState } from "react";
import styles from "../dashboard/Dashboard.module.scss";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { getMySessions } from "../../services/session.service";
import { getNotifications } from "../../services/activity.service";
import {
  getMyCourses,
  type Course,
} from "../../services/courses.service";
import { getMyProfile } from "../../services/profile.service";
import StatsCard from "./StatsCard";
import ActivityFeed from "./ActivityFeed";
import UpcomingSessions from "./UpcomingSessions";
import TutorSection from "./TutorSection";

interface DashboardSessionUser {
  _id: string;
  username: string;
  email?: string;
}

interface DashboardSession {
  _id: string;
  title: string;
  description?: string;
  date: string;
  duration: number;
  status: "pending" | "accepted" | "completed" | "cancelled";
  price: number;
  student: DashboardSessionUser;
  tutor: DashboardSessionUser;
}

interface DashboardActivity {
  _id: string;
  action: string;
  type: string;
  message?: string;
  isRead?: boolean;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  const [sessions, setSessions] = useState<DashboardSession[]>([]);
  const [activity, setActivity] = useState<DashboardActivity[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user?._id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const requests: Promise<unknown>[] = [
          getMySessions(),
          getNotifications(),
          getMyProfile(),
        ];

        if (user.isTutor) {
          requests.push(getMyCourses());
        }

        const [sessionsRes, activityRes, profileRes, tutorCoursesRes] =
          await Promise.all(requests);

        setSessions((sessionsRes as DashboardSession[]) || []);
        setActivity((activityRes as DashboardActivity[]) || []);
        setDisplayName(
          (profileRes as { fullName?: string })?.fullName ||
            user.username
        );
        setCourses((tutorCoursesRes as Course[]) || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading]);

  const now = Date.now();

  const upcomingSessions = useMemo(
    () =>
      sessions
        .filter(
          (session) =>
            session.status === "accepted" &&
            new Date(session.date).getTime() > now
        )
        .sort(
          (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
    [sessions, now]
  );

  const pendingSessions = useMemo(
    () =>
      sessions.filter(
        (session) =>
          session.status === "pending" &&
          session.tutor?._id === user?._id
      ),
    [sessions, user?._id]
  );

  const completedSessions = useMemo(
    () => sessions.filter((session) => session.status === "completed"),
    [sessions]
  );

  const tutorCompletedSessions = useMemo(
    () =>
      completedSessions.filter(
        (session) => session.tutor?._id === user?._id
      ),
    [completedSessions, user?._id]
  );

  const totalTutorRevenue = tutorCompletedSessions.reduce(
    (sum, session) => sum + (session.price || 0),
    0
  );

  const weightedRatings = useMemo(() => {
    const ratedCourses = courses.filter(
      (course) => (course.totalRatings || 0) > 0
    );

    const totalRatings = ratedCourses.reduce(
      (sum, course) => sum + (course.totalRatings || 0),
      0
    );

    if (!totalRatings) {
      return 0;
    }

    const weightedScore = ratedCourses.reduce(
      (sum, course) =>
        sum +
        (course.averageRating || 0) * (course.totalRatings || 0),
      0
    );

    return Number((weightedScore / totalRatings).toFixed(1));
  }, [courses]);

  const stats = useMemo(() => {
    const baseStats = [
      {
        title: "Total Sessions",
        value: String(sessions.length),
        tone: "default" as const,
        meta: "All booked sessions",
      },
      {
        title: "Completed",
        value: String(completedSessions.length),
        tone: "success" as const,
        meta: "Finished successfully",
      },
      {
        title: "Upcoming",
        value: String(upcomingSessions.length),
        tone: "accent" as const,
        meta:
          upcomingSessions[0]
            ? `Next: ${new Date(upcomingSessions[0].date).toLocaleDateString()}`
            : "Nothing scheduled yet",
      },
    ];

    if (!user?.isTutor) {
      return baseStats;
    }

    return [
      ...baseStats,
      {
        title: "Pending Requests",
        value: String(pendingSessions.length),
        tone: "warning" as const,
        meta: "Waiting for your response",
      },
      {
        title: "Tutor Revenue",
        value: `₹${totalTutorRevenue.toLocaleString("en-IN")}`,
        tone: "success" as const,
        meta: `${tutorCompletedSessions.length} completed tutor sessions`,
      },
      {
        title: "Course Rating",
        value: weightedRatings ? `${weightedRatings}★` : "New",
        tone: "accent" as const,
        meta: courses.length
          ? `${courses.length} active courses`
          : "No courses published yet",
      },
    ];
  }, [
    completedSessions.length,
    courses.length,
    pendingSessions.length,
    sessions.length,
    totalTutorRevenue,
    tutorCompletedSessions.length,
    upcomingSessions,
    user?.isTutor,
    weightedRatings,
  ]);

  if (authLoading || loading || !user) {
    return <div className={styles.loader}>Loading dashboard...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <span className={styles.kicker}>Dashboard</span>
          <h1>
            Welcome back, {displayName || user.username}
            {user.isTutor && (
              <span className={styles.tutorBadge}>Tutor</span>
            )}
          </h1>
          <p>
            {user.isTutor
              ? "Monitor your teaching pipeline, revenue, and learner activity."
              : "Track your learning sessions, upcoming bookings, and recent activity."}
          </p>
        </div>

        <div className={styles.snapshot}>
          <span className={styles.snapshotLabel}>Today</span>
          <strong>
            {upcomingSessions.length
              ? `${upcomingSessions.length} session${
                  upcomingSessions.length > 1 ? "s" : ""
                } ahead`
              : "No live commitments"}
          </strong>
          <span className={styles.snapshotHint}>
            {pendingSessions.length
              ? `${pendingSessions.length} request${
                  pendingSessions.length > 1 ? "s" : ""
                } waiting on you`
              : "Everything is up to date"}
          </span>
        </div>
      </motion.div>

      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            meta={stat.meta}
            tone={stat.tone}
          />
        ))}
      </div>

      <div className={styles.mainGrid}>
        <UpcomingSessions
          sessions={upcomingSessions}
          userId={user._id}
        />
        <ActivityFeed activity={activity} />
      </div>

      {user.isTutor ? (
        <TutorSection
          summary={{
            courseCount: courses.length,
            pendingRequests: pendingSessions.length,
            averageRating: weightedRatings,
          }}
        />
      ) : null}
    </div>
  );
};

export default Dashboard;
