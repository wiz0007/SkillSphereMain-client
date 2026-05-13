import { useEffect, useMemo, useState } from "react";
import {
  adjustAdminUserWallet,
  deleteAdminUser,
  deleteAdminCourse,
  deleteAdminReview,
  getAdminCourses,
  getAdminOverview,
  getAdminReviews,
  getAdminSessions,
  getAdminSupportConversations,
  getAdminUsers,
  getAdminWalletTransactions,
  setAdminCoursePublishStatus,
  updateAdminSupportStatus,
  type AdminCourse,
  type AdminOverview,
  type AdminReview,
  type AdminSession,
  type AdminSupportConversation,
  type AdminUser,
  type AdminWalletTransaction,
} from "../../services/admin.service";
import styles from "./AdminPortal.module.scss";

type AdminTab =
  | "overview"
  | "users"
  | "courses"
  | "sessions"
  | "support"
  | "reviews"
  | "wallet";

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "courses", label: "Courses" },
  { id: "sessions", label: "Sessions" },
  { id: "support", label: "Support" },
  { id: "reviews", label: "Reviews" },
  { id: "wallet", label: "Wallet" },
];

const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [search, setSearch] = useState("");
  const [walletAmounts, setWalletAmounts] = useState<Record<string, string>>({});
  const [walletNotes, setWalletNotes] = useState<Record<string, string>>({});

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [support, setSupport] = useState<AdminSupportConversation[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [wallet, setWallet] = useState<AdminWalletTransaction[]>([]);

  const loadAll = async (userSearch = "") => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const [
        nextOverview,
        nextUsers,
        nextCourses,
        nextSessions,
        nextSupport,
        nextReviews,
        nextWallet,
      ] = await Promise.all([
        getAdminOverview(),
        getAdminUsers(userSearch),
        getAdminCourses(),
        getAdminSessions(),
        getAdminSupportConversations(),
        getAdminReviews(),
        getAdminWalletTransactions(),
      ]);

      setOverview(nextOverview);
      setUsers(nextUsers);
      setCourses(nextCourses);
      setSessions(nextSessions);
      setSupport(nextSupport);
      setReviews(nextReviews);
      setWallet(nextWallet);
    } catch (nextError: any) {
      setError(nextError?.message || "Failed to load admin portal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      [user.username, user.email, user.fullName || ""]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [search, users]);

  const handleUserSearch = async (value: string) => {
    setSearch(value);
    if (!value.trim()) {
      void loadAll();
      return;
    }

    try {
      const nextUsers = await getAdminUsers(value);
      setUsers(nextUsers);
    } catch (nextError: any) {
      setError(nextError?.message || "Failed to search users");
    }
  };

  const handleTogglePublish = async (course: AdminCourse) => {
    try {
      await setAdminCoursePublishStatus(course._id, !course.isPublished);
      setCourses((previous) =>
        previous.map((entry) =>
          entry._id === course._id
            ? { ...entry, isPublished: !entry.isPublished }
            : entry
        )
      );
    } catch (nextError: any) {
      setError(nextError?.message || "Failed to update course status");
    }
  };

  const handleUserWalletChange = async (
    user: AdminUser,
    action: "credit" | "debit"
  ) => {
    const rawAmount = walletAmounts[user._id] || "";
    const amount = Number(rawAmount);
    const note = (walletNotes[user._id] || "").trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid SkillCoin amount before applying a wallet action");
      return;
    }

    const confirmed = window.confirm(
      `${action === "credit" ? "Credit" : "Debit"} ${amount} SC ${
        action === "credit" ? "to" : "from"
      } ${user.fullName || user.username}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const result = await adjustAdminUserWallet(user._id, {
        action,
        amount,
        note,
      });

      if (result.wallet) {
        setUsers((previous) =>
          previous.map((entry) =>
            entry._id === user._id
              ? {
                  ...entry,
                  skillCoinBalance: result.wallet!.skillCoinBalance,
                  lockedSkillCoins: result.wallet!.lockedSkillCoins,
                }
              : entry
          )
        );
      }
      setWalletAmounts((previous) => ({ ...previous, [user._id]: "" }));
      setWalletNotes((previous) => ({ ...previous, [user._id]: "" }));
      setError("");
      setSuccessMessage(
        action === "credit"
          ? `Gift sent to ${user.fullName || user.username}`
          : `${amount} SC debited from ${user.fullName || user.username}`
      );
      void loadAll(search);
    } catch (nextError: any) {
      setError(nextError?.message || "Failed to update user wallet");
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    const confirmed = window.confirm(
      `Delete ${user.fullName || user.username} from SkillSphere? This will remove their courses, sessions, reviews, messages, and wallet history.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminUser(user._id);
      setUsers((previous) => previous.filter((entry) => entry._id !== user._id));
      setSuccessMessage(`${user.fullName || user.username} deleted successfully`);
      void loadAll(search);
    } catch (nextError: any) {
      setError(nextError?.message || "Failed to delete user");
    }
  };

  const handleDeleteCourse = async (course: AdminCourse) => {
    const confirmed = window.confirm(
      `Delete "${course.title}" from the platform?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminCourse(course._id);
      setCourses((previous) =>
        previous.filter((entry) => entry._id !== course._id)
      );
    } catch (nextError: any) {
      setError(nextError?.message || "Failed to delete course");
    }
  };

  const handleSupportStatus = async (
    conversation: AdminSupportConversation,
    status: AdminSupportConversation["status"]
  ) => {
    try {
      await updateAdminSupportStatus(conversation._id, status);
      setSupport((previous) =>
        previous.map((entry) =>
          entry._id === conversation._id ? { ...entry, status } : entry
        )
      );
    } catch (nextError: any) {
      setError(nextError?.message || "Failed to update support status");
    }
  };

  const handleDeleteReview = async (review: AdminReview) => {
    const confirmed = window.confirm(
      `Delete this review from ${review.user.username}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminReview(review._id);
      setReviews((previous) =>
        previous.filter((entry) => entry._id !== review._id)
      );
    } catch (nextError: any) {
      setError(nextError?.message || "Failed to delete review");
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>Admin Portal</span>
          <h1>Operate SkillSphere from one secure workspace</h1>
          <p>
            Review platform activity, moderate courses and reviews, track
            support conversations, and monitor wallet operations without
            leaving the admin surface.
          </p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          onClick={() => void loadAll(search)}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh data"}
        </button>
      </div>

      <div className={styles.tabRow}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tabButton} ${
              activeTab === tab.id ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error ? <div className={styles.errorBanner}>{error}</div> : null}
      {successMessage ? (
        <div className={styles.successBanner}>{successMessage}</div>
      ) : null}

      {loading && !overview ? (
        <div className={styles.loadingState}>Loading admin workspace...</div>
      ) : null}

      {activeTab === "overview" && overview ? (
        <div className={styles.stack}>
          <div className={styles.metricGrid}>
            {[
              ["Users", overview.metrics.totalUsers],
              ["Tutors", overview.metrics.totalTutors],
              ["Courses", overview.metrics.totalCourses],
              ["Recorded", overview.metrics.recordedCourses],
              ["Sessions", overview.metrics.totalSessions],
              ["Pending sessions", overview.metrics.pendingSessions],
              ["Support threads", overview.metrics.totalSupportThreads],
              ["Pending support", overview.metrics.pendingSupportThreads],
              ["Reviews", overview.metrics.totalReviews],
              ["Wallet events", overview.metrics.totalWalletTransactions],
            ].map(([label, value]) => (
              <article key={label} className={styles.metricCard}>
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </div>

          <div className={styles.twoColumn}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Recent users</h2>
              </div>
              <div className={styles.list}>
                {overview.recentUsers.map((user) => (
                  <div key={user._id} className={styles.listRow}>
                    <div>
                      <strong>{user.fullName || user.username}</strong>
                      <span>
                        @{user.username} | {user.email}
                      </span>
                    </div>
                    <span className={styles.statusPill}>
                      {user.isAdmin
                        ? "Admin"
                        : user.isTutor
                          ? "Tutor"
                          : "User"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Recent platform activity</h2>
              </div>
              <div className={styles.list}>
                {overview.recentActivities.map((activity) => (
                  <div key={activity._id} className={styles.listRow}>
                    <div>
                      <strong>{activity.message}</strong>
                      <span>
                        {activity.type} | {activity.action}
                      </span>
                    </div>
                    <span className={styles.timestamp}>
                      {new Date(activity.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === "users" ? (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>User management</h2>
            <input
              className={styles.searchInput}
              placeholder="Search by username, email, or name"
              value={search}
              onChange={(event) => void handleUserSearch(event.target.value)}
            />
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Profile</th>
                  <th>Wallet</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <strong>{user.fullName || user.username}</strong>
                      <span>@{user.username} | {user.email}</span>
                    </td>
                    <td>
                      {user.isAdmin
                        ? "Admin"
                        : user.isTutor
                          ? "Tutor"
                          : "User"}
                    </td>
                    <td>{user.isVerified ? "Verified" : "Pending"}</td>
                    <td>
                      {user.profileCompleted ? "Completed" : "Incomplete"}
                    </td>
                    <td>
                      {user.skillCoinBalance} SC / {user.lockedSkillCoins} locked
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.userActionStack}>
                        <div className={styles.inlineWalletTools}>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            className={styles.amountInput}
                            placeholder="SC amount"
                            value={walletAmounts[user._id] || ""}
                            onChange={(event) =>
                              setWalletAmounts((previous) => ({
                                ...previous,
                                [user._id]: event.target.value,
                              }))
                            }
                          />
                          <input
                            type="text"
                            className={styles.noteInput}
                            placeholder="Optional note"
                            value={walletNotes[user._id] || ""}
                            onChange={(event) =>
                              setWalletNotes((previous) => ({
                                ...previous,
                                [user._id]: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className={styles.inlineActions}>
                          <button
                            type="button"
                            className={styles.secondaryAction}
                            onClick={() => void handleUserWalletChange(user, "credit")}
                          >
                            Credit SC
                          </button>
                          <button
                            type="button"
                            className={styles.secondaryAction}
                            onClick={() => void handleUserWalletChange(user, "debit")}
                          >
                            Debit SC
                          </button>
                          {!user.isAdmin ? (
                            <button
                              type="button"
                              className={styles.dangerAction}
                              onClick={() => void handleDeleteUser(user)}
                            >
                              Delete user
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {activeTab === "courses" ? (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Course moderation</h2>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Tutor</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id}>
                    <td>
                      <strong>{course.title}</strong>
                      <span>{course.category} | {course.level}</span>
                    </td>
                    <td>{course.tutor.fullName || course.tutor.username}</td>
                    <td>{course.type}</td>
                    <td>
                      {course.price}
                      {course.type === "recorded" ? " SC" : "/hr"}
                    </td>
                    <td>
                      {course.averageRating.toFixed(1)} ({course.totalRatings})
                    </td>
                    <td>{course.isPublished ? "Published" : "Hidden"}</td>
                    <td>
                      <div className={styles.inlineActions}>
                        <button
                          type="button"
                          className={styles.secondaryAction}
                          onClick={() => void handleTogglePublish(course)}
                        >
                          {course.isPublished ? "Hide" : "Publish"}
                        </button>
                        <button
                          type="button"
                          className={styles.dangerAction}
                          onClick={() => void handleDeleteCourse(course)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {activeTab === "sessions" ? (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Session oversight</h2>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Student</th>
                  <th>Tutor</th>
                  <th>Status</th>
                  <th>Coins</th>
                  <th>Scheduled</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session._id}>
                    <td>
                      <strong>{session.title}</strong>
                      <span>{session.course?.type || "live"} course</span>
                    </td>
                    <td>{session.student.fullName || session.student.username}</td>
                    <td>{session.tutor.fullName || session.tutor.username}</td>
                    <td>{session.status}</td>
                    <td>
                      {session.skillCoinAmount} SC / {session.coinStatus}
                    </td>
                    <td>{new Date(session.date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {activeTab === "support" ? (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Support conversations</h2>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Requester</th>
                  <th>Topic</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {support.map((thread) => (
                  <tr key={thread._id}>
                    <td>
                      <strong>{thread.subject}</strong>
                      <span>{thread.assignedTo?.username || "Unassigned"}</span>
                    </td>
                    <td>{thread.requester.fullName || thread.requester.username}</td>
                    <td>{thread.topic}</td>
                    <td>{thread.status}</td>
                    <td>{new Date(thread.lastMessageAt).toLocaleString()}</td>
                    <td>
                      <select
                        className={styles.statusSelect}
                        value={thread.status}
                        onChange={(event) =>
                          void handleSupportStatus(
                            thread,
                            event.target.value as AdminSupportConversation["status"]
                          )
                        }
                      >
                        <option value="open">Open</option>
                        <option value="waiting_on_support">Waiting on support</option>
                        <option value="waiting_on_user">Waiting on user</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {activeTab === "reviews" ? (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Review moderation</h2>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Reviewer</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review._id}>
                    <td>{review.course?.title || "Removed course"}</td>
                    <td>{review.user.fullName || review.user.username}</td>
                    <td>{review.rating}/5</td>
                    <td>{review.comment || "No comment"}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.dangerAction}
                        onClick={() => void handleDeleteReview(review)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {activeTab === "wallet" ? (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Wallet activity</h2>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Audit</th>
                  <th>Description</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {wallet.map((entry) => (
                  <tr key={entry._id}>
                    <td>{entry.user.fullName || entry.user.username}</td>
                    <td>{entry.type}</td>
                    <td>{entry.amount} SC</td>
                    <td>{entry.auditStatus}</td>
                    <td>{entry.description}</td>
                    <td>{new Date(entry.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default AdminPortal;
